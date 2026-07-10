(() => {
  const cards = [...document.querySelectorAll('.inspiration-card')];
  const input = document.getElementById('inspiration-search');
  const form = document.getElementById('search-form');
  const result = document.getElementById('result-note');
  const empty = document.getElementById('empty-state');
  let activeCategory = '全部灵感';
  let query = '';
  let favorites = [];

  try { favorites = JSON.parse(localStorage.getItem('super-image-favorites') || '[]'); } catch (_) {}

  const updateFavorites = () => {
    document.querySelectorAll('[data-favorite]').forEach((button) => {
      const saved = favorites.includes(Number(button.dataset.favorite));
      button.classList.toggle('saved', saved);
      button.setAttribute('aria-pressed', String(saved));
      button.textContent = saved ? '已收藏 ♥' : '收藏 ♡';
    });
  };

  const render = () => {
    let visible = 0;
    cards.forEach((card) => {
      const categoryMatch = activeCategory === '全部灵感' || card.dataset.category === activeCategory;
      const queryMatch = !query || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query.toLowerCase());
      const show = categoryMatch && queryMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    empty.hidden = visible !== 0;
    result.textContent = activeCategory === '全部灵感' && !query ? '每 4 小时更新' : `找到 ${visible} 条相关灵感`;
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === activeCategory));
  };

  document.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      activeCategory = filter.dataset.filter;
      query = '';
      input.value = '';
      render();
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
    render();
    document.getElementById('hot').scrollIntoView({ behavior: 'smooth' });
  });

  updateFavorites();
  render();
})();
