/* Before CSS: resolve theme before the first paint. Storage is optional. */
(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'light';
  try { preference = localStorage.getItem('portfolio-theme') || 'light'; } catch {}
  if (!['dark', 'light', 'system'].includes(preference)) preference = 'light';
  function apply(value) {
    preference = value;
    const resolved = value === 'system' ? (media.matches ? 'dark' : 'light') : value;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'dark' ? '#191420' : '#fcf8f6';
  }
  window.setPortfolioTheme = value => {
    if (!['dark', 'light', 'system'].includes(value)) return;
    apply(value);
    try { localStorage.setItem('portfolio-theme', value); } catch {}
  };
  media.addEventListener('change', () => { if (preference === 'system') apply('system'); });
  window.addEventListener('storage', event => {
    if (event.key === 'portfolio-theme') {
      apply(['dark', 'light', 'system'].includes(event.newValue) ? event.newValue : 'light');
      document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = preference; });
    }
  });
  apply(preference);
})();

