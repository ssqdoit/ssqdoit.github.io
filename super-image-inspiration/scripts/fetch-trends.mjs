import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'data/trends.json');
const TIKHUB_API_KEY = process.env.TIKHUB_API_KEY || '';
const MAX_PER_SOURCE = 12;

const sources = [];
const items = [];
const log = (...args) => console.log('[trend-radar]', ...args);

const fetchJson = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally { clearTimeout(timer); }
};

const fetchText = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally { clearTimeout(timer); }
};

const cleanText = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const decodeEntities = (value) => String(value || '')
  .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
const numberValue = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
const compactMetric = (value) => {
  const number = numberValue(value);
  if (!number) return '实时话题';
  if (number >= 100000000) return `${(number / 100000000).toFixed(1)} 亿`;
  if (number >= 10000) return `${(number / 10000).toFixed(1)} 万`;
  return number.toLocaleString('zh-CN');
};
const hash = (value) => {
  let result = 2166136261;
  for (const char of String(value)) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};

const addSource = (id, label, status, message, count = 0, mode = 'public') => {
  sources.push({ id, label, status, message, count, mode });
};

const dedupeAndLimit = (records, platform) => {
  const seen = new Set();
  return records.filter((item) => {
    const key = `${platform}:${cleanText(item.title).toLowerCase()}`;
    if (!item.title || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_PER_SOURCE).map((item, index) => ({
    id: item.id || `${platform}-${hash(item.url || item.title)}`,
    platform,
    title: cleanText(item.title).slice(0, 180),
    url: item.url,
    thumbnail: item.thumbnail || '',
    author: cleanText(item.author || '').slice(0, 80),
    score: numberValue(item.score) || MAX_PER_SOURCE - index,
    metric: item.metric || compactMetric(item.score),
    tags: (item.tags || []).map(cleanText).filter(Boolean).slice(0, 4),
    publishedAt: item.publishedAt || null,
    collectedAt: new Date().toISOString()
  }));
};

async function fetchReddit() {
  const subreddits = ['graphic_design', 'photoshop', 'midjourney', 'StableDiffusion'];
  const records = [];
  const errors = [];
  const fetchSubreddit = async (subreddit) => {
    try {
      const data = await fetchJson(`https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=10&raw_json=1`, {
        headers: { 'User-Agent': 'super-image-inspiration/1.0 (trend research; github pages)' }
      }, 10000);
      for (const child of data?.data?.children || []) {
        const post = child?.data || {};
        const preview = post.preview?.images?.[0]?.source?.url || '';
        const thumbnail = /^https?:/.test(post.thumbnail || '') ? post.thumbnail : preview;
        records.push({
          id: `reddit-${post.id}`,
          title: post.title,
          url: `https://www.reddit.com${post.permalink || ''}`,
          thumbnail: thumbnail.replaceAll('&amp;', '&'),
          author: `r/${post.subreddit}`,
          score: (post.ups || 0) + (post.num_comments || 0) * 3,
          metric: `${compactMetric(post.ups)} 赞 · ${post.num_comments || 0} 讨论`,
          tags: [`r/${post.subreddit}`, post.post_hint || '讨论'],
          publishedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : null
        });
      }
    } catch (jsonError) {
      try {
        const xml = await fetchText(`https://www.reddit.com/r/${subreddit}/top/.rss?t=day`, {
          headers: { 'User-Agent': 'super-image-inspiration/1.0 (trend research; github pages)', Accept: 'application/atom+xml' }
        }, 10000);
        const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        for (const entry of entries.slice(0, 10)) {
          const title = decodeEntities(entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '');
          const url = decodeEntities(entry.match(/<link[^>]+href="([^"]+)"/)?.[1] || '');
          const author = decodeEntities(entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/)?.[1] || '');
          const content = decodeEntities(entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || '');
          const thumbnail = content.match(/<img[^>]+src="([^"]+)"/)?.[1] || '';
          records.push({
            id: `reddit-${hash(url || title)}`, title, url, thumbnail, author: `r/${subreddit}${author ? ` · ${author}` : ''}`,
            score: 10 - records.length, metric: '社区日榜', tags: [`r/${subreddit}`, 'Reddit RSS']
          });
        }
      } catch (rssError) { errors.push(`${subreddit}: JSON ${jsonError.message}; RSS ${rssError.message}`); }
    }
  };
  await Promise.all(subreddits.map(fetchSubreddit));
  let normalized = dedupeAndLimit(records.sort((a, b) => b.score - a.score), 'reddit');
  let mode = 'public-api';
  let message = normalized.length ? '公开社区日榜' : errors.join('; ');
  if (!normalized.length && TIKHUB_API_KEY) {
    try {
      const payload = await tikhubRequest('/api/v1/reddit/app/fetch_dynamic_search?query=graphic%20design&search_type=post&safe_search=unset&allow_nsfw=0&after=&need_format=false');
      normalized = normalizeTikHub(payload, 'reddit');
      mode = 'credentialed-api';
      message = normalized.length ? 'TikHub Reddit 实时搜索' : 'TikHub API 未返回可解析内容';
    } catch (error) { message = `${message}; TikHub: ${error.message}`; }
  }
  items.push(...normalized);
  addSource('reddit', 'Reddit', normalized.length ? 'live' : 'error', message, normalized.length, mode);
}

async function fetchDouyin() {
  try {
    const { handleRoute } = await import('dailyhot-api/dist/routes/douyin.js');
    const payload = await handleRoute({}, false);
    const list = payload?.data || payload?.result || [];
    const records = (Array.isArray(list) ? list : []).map((entry, index) => ({
      id: `douyin-${entry.id || hash(entry.title)}`,
      title: entry.title || entry.word || entry.name,
      url: entry.url || entry.mobileUrl || `https://www.douyin.com/search/${encodeURIComponent(entry.title || '')}`,
      thumbnail: entry.cover || entry.pic || '',
      author: entry.author || '抖音热点榜',
      score: entry.hot || entry.hot_value || entry.score || (1000 - index),
      metric: entry.hot ? `${compactMetric(entry.hot)} 热度` : `热榜第 ${index + 1} 位`,
      tags: ['抖音热榜']
    }));
    const normalized = dedupeAndLimit(records, 'douyin');
    items.push(...normalized);
    addSource('douyin', '抖音', normalized.length ? 'live' : 'error', normalized.length ? 'DailyHot 抖音热点榜' : '接口未返回热点', normalized.length, 'aggregated-public');
  } catch (error) {
    addSource('douyin', '抖音', 'error', error.message, 0, 'aggregated-public');
  }
}

const deepValues = (object, wantedKeys, depth = 0, seen = new Set()) => {
  if (!object || typeof object !== 'object' || depth > 7 || seen.has(object)) return [];
  seen.add(object);
  const results = [];
  for (const [key, value] of Object.entries(object)) {
    if (wantedKeys.includes(key) && ['string', 'number'].includes(typeof value)) results.push(value);
    if (value && typeof value === 'object') results.push(...deepValues(value, wantedKeys, depth + 1, seen));
  }
  return results;
};

const findBestArray = (payload) => {
  const arrays = [];
  const walk = (value, depth = 0) => {
    if (!value || typeof value !== 'object' || depth > 8) return;
    if (Array.isArray(value)) {
      if (value.length && value.some((item) => item && typeof item === 'object')) arrays.push(value);
      value.slice(0, 6).forEach((item) => walk(item, depth + 1));
    } else Object.values(value).forEach((item) => walk(item, depth + 1));
  };
  walk(payload);
  const titleKeys = ['title', 'desc', 'text', 'name', 'word', 'query', 'keyword', 'note_title', 'content'];
  return arrays.sort((a, b) => {
    const rank = (array) => array.slice(0, 10).reduce((score, object) => score + deepValues(object, titleKeys).length, 0);
    return rank(b) - rank(a);
  })[0] || [];
};

const normalizeTikHub = (payload, platform) => {
  const records = findBestArray(payload);
  const titleKeys = ['title', 'desc', 'full_text', 'text', 'name', 'word', 'query', 'keyword', 'note_title', 'content'];
  const urlKeys = ['share_url', 'url', 'web_url', 'note_url', 'jump_url', 'permalink'];
  const imageKeys = ['cover', 'cover_url', 'thumbnail', 'thumbnail_url', 'image', 'image_url', 'origin_cover', 'dynamic_cover'];
  const authorKeys = ['nickname', 'screen_name', 'unique_id', 'author_name', 'user_name'];
  const metricKeys = ['hot_value', 'view_count', 'play_count', 'digg_count', 'favorite_count', 'tweet_volume', 'score', 'likes'];
  return dedupeAndLimit(records.map((record, index) => {
    const title = deepValues(record, titleKeys).map(cleanText).find((value) => value.length > 1) || '';
    const rawUrl = deepValues(record, urlKeys).find((value) => /^https?:/.test(String(value))) || '';
    const id = deepValues(record, ['aweme_id', 'note_id', 'tweet_id', 'id_str', 'id']).find(Boolean) || hash(title);
    const fallbackUrls = {
      x: `https://x.com/search?q=${encodeURIComponent(title)}`,
      tiktok: `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`,
      xiaohongshu: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(title)}`,
      reddit: `https://www.reddit.com/search/?q=${encodeURIComponent(title)}`
    };
    const score = Math.max(...deepValues(record, metricKeys).map(numberValue), MAX_PER_SOURCE - index);
    return {
      id: `${platform}-${id}`,
      title,
      url: rawUrl || fallbackUrls[platform],
      thumbnail: deepValues(record, imageKeys).find((value) => /^https?:/.test(String(value))) || '',
      author: deepValues(record, authorKeys).map(cleanText).find(Boolean) || '',
      score,
      metric: compactMetric(score),
      tags: [platform === 'x' ? 'X 趋势' : platform === 'tiktok' ? 'TikTok 热门' : platform === 'reddit' ? 'Reddit 热门' : '小红书热门']
    };
  }), platform);
};

async function tikhubRequest(path, { method = 'GET', body } = {}) {
  const url = new URL(path, 'https://api.tikhub.io');
  const options = {
    method,
    headers: { Authorization: `Bearer ${TIKHUB_API_KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  return fetchJson(url, options, 45000);
}

async function fetchTikHubSources() {
  const definitions = [
    { id: 'x', label: 'X', path: '/api/v1/twitter/web/fetch_trending?country=UnitedStates' },
    { id: 'tiktok', label: 'TikTok', path: '/api/v1/tiktok/web/fetch_search_video?keyword=photo%20editing&count=20&offset=0&search_id=' },
    { id: 'xiaohongshu', label: '小红书', path: '/api/v1/xiaohongshu/web/search_notes?keyword=P%E5%9B%BE&page=1&sort=general&noteType=_0&noteTime=' }
  ];
  if (!TIKHUB_API_KEY) {
    definitions.forEach(({ id, label }) => addSource(id, label, 'needs-key', '在仓库 Secrets 中配置 TIKHUB_API_KEY 后自动启用', 0, 'credentialed-api'));
    return;
  }
  for (const definition of definitions) {
    try {
      const payload = await tikhubRequest(definition.path);
      const normalized = normalizeTikHub(payload, definition.id);
      items.push(...normalized);
      addSource(definition.id, definition.label, normalized.length ? 'live' : 'error', normalized.length ? 'TikHub 实时数据' : 'API 返回成功但没有可解析结果', normalized.length, 'credentialed-api');
    } catch (error) {
      addSource(definition.id, definition.label, 'error', error.message, 0, 'credentialed-api');
    }
  }
}

const readPrevious = async () => {
  try { return JSON.parse(await readFile(outputPath, 'utf8')); } catch (_) { return null; }
};

async function main() {
  const previous = await readPrevious();
  await Promise.all([fetchReddit(), fetchDouyin(), fetchTikHubSources()]);
  const freshPlatforms = new Set(items.map((item) => item.platform));
  if (previous?.items) {
    for (const source of sources.filter((entry) => !['live', 'needs-key'].includes(entry.status))) {
      const cached = previous.items.filter((item) => item.platform === source.id).slice(0, MAX_PER_SOURCE);
      if (cached.length && !freshPlatforms.has(source.id)) {
        items.push(...cached);
        source.status = 'stale';
        source.count = cached.length;
        source.message = `${source.message}；正在展示上次成功数据`;
      }
    }
  }
  const order = { douyin: 0, xiaohongshu: 1, tiktok: 2, x: 3, reddit: 4 };
  items.sort((a, b) => (order[a.platform] ?? 9) - (order[b.platform] ?? 9) || b.score - a.score);
  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    refreshMinutes: 120,
    sources: sources.sort((a, b) => (order[a.id] ?? 9) - (order[b.id] ?? 9)),
    items,
    note: '热点来自公开信息与已授权 API，仅用于创意研究，请前往原平台核实。'
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  log(`wrote ${items.length} items to ${outputPath}`);
  sources.forEach((source) => log(`${source.label}: ${source.status} (${source.count})`));
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error(error); process.exit(1); });
