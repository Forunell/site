'use strict';
(() => {
  const profile = window.PORTFOLIO || {};
  const projects = [...(window.PROJECTS || [])].sort((a, b) => a.order - b.order);
  const name = typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : 'Розробник';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const link = input => {
    try { const u = new URL(input); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
  };
  const asset = input => typeof input === 'string' && /^assets\/[a-z0-9_./-]+\.(webp|png|jpg|svg)$/i.test(input) && !input.includes('..') ? input : '';
  const url = project => `case.html?project=${encodeURIComponent(project.slug)}`;
  const tags = values => `<div class="tags">${values.map(value => `<span>${esc(value)}</span>`).join('')}</div>`;
  const labels = { local: 'Локальна демонстрація', demo: 'Демоверсія', development: 'У розробці', public: 'Публічна версія', planned: 'Концепція' };
  const status = p => labels[p.status] || 'Статус уточнюється';
  const image = (g, options = '') => `<img src="assets/${esc(g.key)}-1440.webp" srcset="assets/${esc(g.key)}-720.webp 720w, assets/${esc(g.key)}-1440.webp 1440w" sizes="${options || '(max-width: 600px) 88vw, (max-width: 850px) 80vw, 58vw'}" width="${Number(g.width)}" height="${Number(g.height)}" alt="${esc(g.alt)}" loading="lazy" decoding="async"><span class="image-fallback" hidden>Знімок недоступний. Опис і можливості — нижче.</span>`;
  document.querySelectorAll('[data-display-name]').forEach(el => { el.textContent = name; });
  document.querySelectorAll('[data-location]').forEach(el => { el.textContent = profile.location || 'Україна · дистанційно'; });
  document.querySelectorAll('[data-initial]').forEach(el => { el.textContent = name[0].toUpperCase(); });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('.identity').forEach(el => el.setAttribute('aria-label', `${name} — на головну`));
  document.querySelectorAll('[data-theme-select]').forEach(select => {
    select.value = document.documentElement.dataset.themePreference;
    select.addEventListener('change', () => window.setPortfolioTheme(select.value));
  });

  function metadata(title, description, screenshot) {
    document.title = title;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector(selector)?.setAttribute('content', description);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector)?.setAttribute('content', title);
    const domain = link(profile.productionUrl);
    if (domain) {
      const base = domain.endsWith('/') ? domain : domain + '/';
      const path = document.body.dataset.page === 'case' ? `case.html${location.search}` : 'index.html';
      const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = new URL(path, base).href; document.head.append(canonical);
      for (const key of ['og:image', 'twitter:image']) { const meta = document.createElement('meta'); meta.setAttribute(key.startsWith('og:') ? 'property' : 'name', key); meta.content = new URL(screenshot, base).href; document.head.append(meta); }
    }
  }

  function actions(p) {
    return [['Відкрити демо', p.demoUrl], ['Код на GitHub', p.githubUrl]].map(([label, value]) => {
      const safe = link(value);
      return safe ? `<a class="button secondary" href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${label} ↗<span class="sr-only"> (у новій вкладці)</span></a>` : '';
    }).join('');
  }

  const grid = document.getElementById('projects-grid');
  if (grid) {
    grid.innerHTML = projects.map((p, index) => {
      const g = p.gallery?.[0];
      const thumb = asset(p.thumbnail);
      return `<article class="project-card" data-category="${esc(p.category)}" data-project="${esc(p.slug)}"><a class="project-cover image-frame" href="${url(p)}" aria-label="Кейс ${esc(p.title)}">${thumb ? `<img src="${esc(thumb)}" ${g ? `srcset="${esc(thumb)} 720w, assets/${esc(g.key)}-1440.webp 1440w"` : ''} sizes="(max-width: 600px) 90vw, 48vw" width="${g?.width || 1440}" height="${g?.height || 1000}" alt="${esc(g?.alt || p.title)}" loading="eager" decoding="async">` : ''}<span class="image-fallback" ${thumb ? 'hidden' : ''}>Скриншот ще не додано. Відкрити кейс →</span></a><div class="project-copy"><div class="project-meta"><span>${String(index + 1).padStart(2, '0')} / ${esc(p.kind)}</span><span class="project-status">${p.status === 'local' ? 'Локальне демо' : esc(status(p))}</span></div><h3><a href="${url(p)}">${esc(p.title)}</a></h3><p>${esc(p.description)}</p><details class="project-feature-details"><summary>Можливості <span>+</span></summary><ul class="project-features">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details><div class="project-bottom">${tags(p.stack)}<a class="case-link" href="${url(p)}">Дивитися кейс <span aria-hidden="true">↗</span><span class="sr-only"> ${esc(p.title)}</span></a>${actions(p)}</div></div></article>`;
    }).join('');
    const buttons = [...document.querySelectorAll('[data-filter]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let count = 0;
      grid.querySelectorAll('.project-card').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; if (!card.hidden) count++; });
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.getElementById('filter-status').textContent = `Показано проєктів: ${count} із ${projects.length}.`;
    }));
    metadata(`${name} — вебзастосунки та автоматизація`, 'Власні локальні продукти: вебзастосунки, CRM та автоматизація даних. Реальні інтерфейси, прозорі обмеження й зрозумілий процес роботи.', 'assets/og-cover.png');
  }

  const contacts = document.getElementById('public-contacts');
  const email = typeof profile.email === 'string' && /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(profile.email) ? profile.email : '';
  let emailAnchor;
  if (contacts) {
    [['Написати на пошту', email ? `mailto:${email}` : null], ['GitHub', link(profile.github)], ['Telegram', link(profile.telegram)]].forEach(([label, href]) => {
      if (!href) return;
      const a = document.createElement('a'); a.href = href; a.textContent = label + ' ↗';
      if (href.startsWith('mailto:')) { emailAnchor = a; a.setAttribute('aria-label', `Написати на пошту ${email}`); }
      else { a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', `${label} (у новій вкладці)`); }
      contacts.append(a);
    });
    if (!contacts.children.length) { document.getElementById('contact-warning').hidden = false; document.querySelector('.contact-note').hidden = true; }
    document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => {
      if (emailAnchor) emailAnchor.href = `mailto:${email}?subject=${encodeURIComponent(a.dataset.service)}`;
    }));
  }

  const menu = document.getElementById('mobile-nav');
  const menuToggle = document.getElementById('menu-toggle');
  function closeMenu(restore = false) {
    if (!menu) return;
    menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Відкрити меню');
    if (restore) menuToggle.focus();
  }
  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (!menu.hidden) return closeMenu();
      menu.hidden = false; menuToggle.setAttribute('aria-expanded', 'true'); menuToggle.setAttribute('aria-label', 'Закрити меню');
      menu.querySelector('a').focus();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      closeMenu(); const target = document.querySelector(a.hash);
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    }));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
    document.addEventListener('click', event => { if (!menu.hidden && !event.target.closest('.header')) closeMenu(); });
    window.matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeMenu(menu.contains(document.activeElement)); });
  }

  const sections = [...document.querySelectorAll('main > section[id]')];
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(a => {
        if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  const caseContent = document.getElementById('case-content');
  if (caseContent) {
    const slug = new URLSearchParams(location.search).get('project');
    const p = projects.find(project => project.slug === slug);
    if (!p) {
      caseContent.innerHTML = '<div class="missing-case"><p class="eyebrow">КЕЙС НЕ ЗНАЙДЕНО</p><h1>Цього проєкту немає.</h1><a class="button primary" href="index.html#work">Повернутися до робіт →</a></div>';
      metadata(`Кейс не знайдено — ${name}`, 'Поверніться до переліку робіт, щоб обрати проєкт.', 'assets/og-cover.png');
      const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex'; document.head.append(meta);
    } else {
      const next = projects[(projects.indexOf(p) + 1) % projects.length];
      const gallery = p.gallery || [];
      metadata(`${p.title} — ${p.kind} | ${name}`, p.description, gallery.length ? `assets/${gallery[0].key}-1440.webp` : 'assets/og-cover.png');
      const demoLinks = actions(p);
      caseContent.innerHTML = `<a class="back-link" href="index.html#work">← Усі роботи</a><section class="case-hero"><div><p class="eyebrow">${String(p.order).padStart(2, '0')} / ${esc(p.kind)}</p><h1>${esc(p.title)}</h1><p class="case-tagline">${esc(p.tagline)}</p></div><div class="case-summary"><span class="project-status">${esc(status(p))}</span><p>${esc(p.description)}</p>${tags(p.stack)}</div></section><div class="case-actions"><a class="button primary" href="#verification">Як перевірити <span aria-hidden="true">↓</span></a>${demoLinks}<a class="button secondary" href="index.html#contact">Обговорити схожу задачу ↗</a></div>${!link(p.demoUrl) ? '<p class="availability"><strong>Локальна демонстрація.</strong> Публічне онлайн-демо ще не розміщено. Нижче — реальні скриншоти та сценарій перевірки.</p>' : ''}${gallery.length ? `<figure style="margin-top:28px"><button class="case-cover image-frame" type="button" data-gallery="0" aria-label="Збільшити: ${esc(gallery[0].caption)}">${image(gallery[0], '90vw')}<span class="zoom-label">Роздивитися інтерфейс ↗</span></button><figcaption class="case-caption">${esc(p.title)} / ${esc(gallery[0].caption)} · Реальний скриншот локального застосунку</figcaption></figure>` : '<p class="availability" style="margin-top:28px">Скриншоти ще не додано.</p>'}<section class="case-section"><h2>01 / Задача</h2><div><h3>${esc(p.problem)}</h3><p>${esc(p.audience)}</p></div></section><section class="case-section"><h2>02 / Що реалізовано</h2><div><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div></section><section class="case-section"><h2>03 / Інтерфейс</h2><div class="case-gallery">${gallery.map((g, i) => `<button class="gallery-item" type="button" data-gallery="${i}" aria-label="Збільшити: ${esc(g.caption)}"><span class="image-frame">${image(g, '(max-width: 850px) 85vw, 35vw')}</span><span class="gallery-label"><span>${String(i+1).padStart(2,'0')} / ${esc(g.caption)}</span><span aria-hidden="true">↗</span></span></button>`).join('')}<p class="case-gallery-note">Натисніть на знімок, щоб відкрити його повністю. Дані на екранах демонстраційні.</p></div></section><section class="case-section"><h2>04 / Підхід</h2><div><p>${esc(p.approach)}</p></div></section><section class="case-section" id="verification"><h2>05 / Як перевірити</h2><div><p style="margin-bottom:24px">Сценарій для запущеної локальної версії застосунку.</p><ol class="walkthrough">${p.walkthrough.map(step => `<li>${esc(step)}</li>`).join('')}</ol></div></section><section class="case-section"><h2>06 / Межі продукту</h2><div><p class="case-limit">${esc(p.limitations)}</p><details class="case-evidence"><summary>На чому ґрунтується опис</summary><p>${p.verified ? 'Опис звірено з вихідним кодом і наявними скриншотами 08.11.2026. Це не повторний повний тест застосунку.' : 'Опис потребує перевірки за вихідним кодом.'}</p><ul>${p.evidence.map(file => `<li>${esc(file)}</li>`).join('')}</ul></details></div></section><nav class="case-next" aria-label="Наступний кейс"><a href="${url(next)}"><span>НАСТУПНИЙ ПРОЄКТ / ${String(next.order).padStart(2, '0')}</span><strong>${esc(next.title)}</strong></a><a href="${url(next)}" aria-label="Наступний кейс: ${esc(next.title)}">↗</a></nav>`;
      const dialog = document.getElementById('gallery-dialog');
      const galleryImage = document.getElementById('gallery-image');
      const title = document.getElementById('gallery-title');
      const scrollArea = dialog.querySelector('.lightbox-scroll');
      scrollArea.tabIndex = 0; scrollArea.setAttribute('aria-label', 'Скриншот; прокручуйте, щоб переглянути повністю');
      let current = 0;
      let opener;
      function show(index) {
        current = (index + gallery.length) % gallery.length;
        const g = gallery[current]; galleryImage.hidden = false; scrollArea.querySelector('.image-fallback').hidden = true;
        galleryImage.src = `assets/${g.key}-1440.webp`; galleryImage.alt = g.alt;
        title.textContent = `${current + 1} / ${gallery.length} — ${g.caption}`;
        document.getElementById('gallery-status').textContent = title.textContent;
        scrollArea.scrollTop = 0; scrollArea.scrollLeft = 0;
      }
      document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
        opener = button; show(Number(button.dataset.gallery)); dialog.showModal(); document.getElementById('gallery-close').focus();
      }));
      document.getElementById('gallery-close').addEventListener('click', () => dialog.close());
      document.getElementById('gallery-zoom').addEventListener('click', event => {
        const zoomed = scrollArea.classList.toggle('is-zoomed');
        event.currentTarget.setAttribute('aria-pressed', String(zoomed));
        event.currentTarget.setAttribute('aria-label', zoomed ? 'Вмістити знімок у вікно' : 'Показати в оригінальному розмірі');
      });
      document.getElementById('gallery-prev').addEventListener('click', () => show(current - 1));
      document.getElementById('gallery-next').addEventListener('click', () => show(current + 1));
      dialog.addEventListener('close', () => opener?.focus());
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
          const focusable = [...dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          return;
        }
        if (event.target === scrollArea) return; // Preserve native arrow-key image scrolling.
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
      });
    }
  }
  function failedImage(img) { img.hidden = true; const fallback = img.parentElement.querySelector('.image-fallback'); if (fallback) fallback.hidden = false; }
  document.querySelectorAll('img').forEach(img => { img.addEventListener('error', () => failedImage(img)); if (img.getAttribute('src') && img.complete && !img.naturalWidth) failedImage(img); });
})();
