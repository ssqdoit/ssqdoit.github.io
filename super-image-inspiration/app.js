(() => {
  const cards = [...document.querySelectorAll('.inspiration-card')];
  const input = document.getElementById('inspiration-search');
  const form = document.getElementById('search-form');
  const result = document.getElementById('result-note');
  const empty = document.getElementById('empty-state');
  const liveGrid = document.getElementById('live-grid');
  const liveEmpty = document.getElementById('live-empty');
  const liveRefresh = document.getElementById('live-refresh');
  const platformLabels = { x: 'X', tiktok: 'TikTok', douyin: '抖音', xiaohongshu: '小红书', reddit: 'Reddit' };
  let activeCategory = '全部灵感';
  let activePlatform = 'all';
  let query = '';
  let favorites = [];
  let liveItems = [];

  try { favorites = JSON.parse(localStorage.getItem('super-image-favorites') || '[]'); } catch (_) {}

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const safeUrl = (value, fallback = '#') => {
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : fallback;
    } catch (_) { return fallback; }
  };

  const formatNumber = (number) => {
    const value = Number(number || 0);
    if (!value) return '实时话题';
    if (value >= 100000000) return `${(value / 100000000).toFixed(1)} 亿热度`;
    if (value >= 10000) return `${(value / 10000).toFixed(1)} 万热度`;
    return `${value.toLocaleString('zh-CN')} 热度`;
  };

  const formatTime = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '更新时间未知';
    return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  };

  const updateFavorites = () => {
    document.querySelectorAll('[data-favorite]').forEach((button) => {
      const saved = favorites.includes(Number(button.dataset.favorite));
      button.classList.toggle('saved', saved);
      button.setAttribute('aria-pressed', String(saved));
      button.textContent = saved ? '已收藏 ♥' : '收藏 ♡';
    });
  };

  const renderEditorial = () => {
    let visible = 0;
    cards.forEach((card) => {
      const categoryMatch = activeCategory === '全部灵感' || card.dataset.category === activeCategory;
      const queryMatch = !query || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query.toLowerCase());
      const show = categoryMatch && queryMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    empty.hidden = visible !== 0;
    result.textContent = activeCategory === '全部灵感' && !query ? '6 个可复用玩法' : `找到 ${visible} 条编辑灵感`;
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === activeCategory));
  };

  const renderLive = () => {
    const filtered = liveItems.filter((item) => {
      const platformMatch = activePlatform === 'all' || item.platform === activePlatform;
      const queryMatch = !query || `${item.title || ''} ${(item.tags || []).join(' ')} ${item.author || ''}`.toLowerCase().includes(query.toLowerCase());
      return platformMatch && queryMatch;
    }).slice(0, 18);

    liveGrid.innerHTML = filtered.map((item, index) => {
      const image = safeUrl(item.thumbnail, '');
      const destination = safeUrl(item.url, '#');
      const author = escapeHtml(item.author || (item.tags && item.tags[0]) || '平台热榜');
      return `<a class="live-card${image ? ' with-image' : ''}" href="${escapeHtml(destination)}" target="_blank" rel="noopener noreferrer" data-live-platform="${escapeHtml(item.platform)}">
        ${image ? `<img class="live-card-image" src="${escapeHtml(image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.live-card')?.classList.remove('with-image');this.remove()">` : ''}
        <div class="live-card-body">
          <div class="live-card-top"><span class="platform-label">${escapeHtml(platformLabels[item.platform] || item.platform)}</span><span class="live-rank">TOP ${String(index + 1).padStart(2, '0')}</span></div>
          <h3>${escapeHtml(item.title || '未命名热点')}</h3>
          <div class="live-meta"><span>${author}</span><span class="live-metric">${escapeHtml(item.metric || formatNumber(item.score))}</span></div>
        </div><span class="live-card-arrow" aria-hidden="true">↗</span>
      </a>`;
    }).join('');

    liveGrid.setAttribute('aria-busy', 'false');
    liveEmpty.hidden = filtered.length !== 0;
    document.querySelectorAll('[data-platform]').forEach((button) => button.classList.toggle('active', button.dataset.platform === activePlatform));
  };

  const updateSourceStates = (sources = []) => {
    const map = Object.fromEntries(sources.map((source) => [source.id, source]));
    document.querySelectorAll('.source-chip[data-platform]').forEach((button) => {
      const id = button.dataset.platform;
      if (id === 'all') return;
      const source = map[id];
      if (!source) return;
      button.dataset.status = source.status || 'error';
      const state = button.querySelector('small');
      const labels = { live: `${source.count || 0} 条已更新`, 'needs-key': '待配置授权', error: '暂时不可用', stale: '使用缓存' };
      state.textContent = labels[source.status] || source.message || '状态未知';
      button.title = source.message || '';
    });
  };

  const loadLiveData = async () => {
    try {
      const response = await fetch(`data/trends.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      liveItems = Array.isArray(data.items) ? data.items : [];
      updateSourceStates(data.sources || []);
      const ageHours = (Date.now() - new Date(data.generatedAt).getTime()) / 3600000;
      liveRefresh.classList.toggle('is-fresh', ageHours <= 6);
      liveRefresh.classList.toggle('is-stale', ageHours > 6);
      liveRefresh.querySelector('span:last-child').textContent = `${formatTime(data.generatedAt)} 更新 · ${liveItems.length} 条热点`;
      renderLive();
    } catch (error) {
      liveGrid.innerHTML = '';
      liveGrid.setAttribute('aria-busy', 'false');
      liveEmpty.hidden = false;
      liveRefresh.classList.add('is-stale');
      liveRefresh.querySelector('span:last-child').textContent = '数据更新任务尚未完成';
      console.warn('热点数据读取失败', error);
    }
  };

  document.addEventListener('click', (event) => {
    const platform = event.target.closest('[data-platform]');
    if (platform) {
      activePlatform = platform.dataset.platform;
      renderLive();
      return;
    }
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      activeCategory = filter.dataset.filter;
      query = '';
      input.value = '';
      renderEditorial();
      renderLive();
      document.getElementById('hot').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
      const id = Number(favorite.dataset.favorite);
      favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
      try { localStorage.setItem('super-image-favorites', JSON.stringify(favorites)); } catch (_) {}
      updateFavorites();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    query = input.value.trim();
    activeCategory = '全部灵感';
    activePlatform = 'all';
    renderEditorial();
    renderLive();
    document.getElementById('radar').scrollIntoView({ behavior: 'smooth' });
  });

  updateFavorites();
  renderEditorial();
  loadLiveData();
})();
