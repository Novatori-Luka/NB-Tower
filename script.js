/*
SQL TO RUN IN SUPABASE SQL EDITOR:

CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ka text, name_en text,
  category text, location text,
  status text, image_url text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE team (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text, role_ka text, role_en text,
  initials text, image_url text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  projects_count text,
  clients_count text,
  years_count text,
  sqm_count text
);

CREATE TABLE testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_ka text, quote_en text,
  author text, project text, stars int,
  created_at timestamp DEFAULT now()
);

CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text, email text, phone text,
  message text, created_at timestamp DEFAULT now()
);

CREATE TABLE site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title text,
  meta_description text,
  favicon_url text
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON projects FOR SELECT USING (true);
CREATE POLICY "public read" ON team FOR SELECT USING (true);
CREATE POLICY "public read" ON stats FOR SELECT USING (true);
CREATE POLICY "public read" ON testimonials FOR SELECT USING (true);
CREATE POLICY "public insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public read" ON site_settings FOR SELECT USING (true);

CREATE POLICY "admin all" ON projects FOR ALL USING (true);
CREATE POLICY "admin all" ON team FOR ALL USING (true);
CREATE POLICY "admin all" ON stats FOR ALL USING (true);
CREATE POLICY "admin all" ON testimonials FOR ALL USING (true);
CREATE POLICY "admin all" ON messages FOR ALL USING (true);
CREATE POLICY "admin all" ON site_settings FOR ALL USING (true);
*/

/*
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_floors int;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS area_sqm int;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_type text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_ka text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_en text;
*/

/*
ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE messages DROP COLUMN IF EXISTS email;
*/

/* =============================================
   NB TOWER — script.js
   ============================================= */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     RENDER HELPERS
     Defined first so initSite() can call them.
  ══════════════════════════════════════════════ */

  function _renderTeam(team) {
    const grid = document.querySelector('.team-grid');
    if (!grid) return;
    grid.innerHTML = team.map((m, i) => `
      <div class="team-card reveal" style="--delay:${i * 0.1}s">
        ${m.imageUrl
          ? `<img src="${m.imageUrl}" alt="${m.name}" class="team-avatar" style="object-fit:cover;padding:0">`
          : `<div class="team-avatar">${m.initials}</div>`}
        <div class="team-info">
          <h3 class="team-name">${m.name}</h3>
          <p class="team-role" data-ka="${m.roleKa}" data-en="${m.roleEn}">${m.roleKa}</p>
          <p class="team-bio" data-ka="${m.bioKa || ''}" data-en="${m.bioEn || ''}">${m.bioKa || ''}</p>
        </div>
      </div>`).join('');

    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  function _renderTestimonials(testimonials) {
    const track = document.getElementById('testimonials-track');
    const dotsContainer = document.getElementById('t-dots');
    if (!track || !dotsContainer) return;

    track.innerHTML = testimonials.map(t => {
      const stars = '<i class="fa-solid fa-star"></i>'.repeat(t.stars || 5);
      return `
        <div class="testimonial-card">
          <div class="testimonial-stars">${stars}</div>
          <p class="testimonial-quote" data-ka="${t.quoteKa}" data-en="${t.quoteEn || t.quoteKa}">${t.quoteKa}</p>
          <div class="testimonial-author">
            <div class="ta-avatar">${t.author.charAt(0)}</div>
            <div class="ta-info">
              <strong class="ta-name">${t.author}</strong>
              <span class="ta-project">${t.project}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    dotsContainer.innerHTML = testimonials.map((_, i) =>
      `<button class="t-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');

    // Re-wire dot clicks after re-render
    dotsContainer.querySelectorAll('.t-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => { goToSlide(i); startAuto(); });
    });
  }

  /* ══════════════════════════════════════════════
     SUPABASE DATA INIT
  ══════════════════════════════════════════════ */

  async function initSite() {
    // TEAM
    try {
      const { data: team, error } = await db.from('team').select('*').order('created_at', { ascending: false });
      if (!error && team && team.length) {
        _renderTeam(team.map(m => ({
          id:       m.id,
          name:     m.name,
          roleKa:   m.role_ka,
          roleEn:   m.role_en,
          initials: m.initials,
          imageUrl: m.image_url
        })));
      }
    } catch (e) { console.warn('Team fetch failed', e); }

    // TESTIMONIALS
    try {
      const { data: testimonials, error } = await db.from('testimonials').select('*').order('created_at', { ascending: false });
      if (!error && testimonials && testimonials.length) {
        _renderTestimonials(testimonials.map(t => ({
          id:      t.id,
          quoteKa: t.quote_ka,
          quoteEn: t.quote_en,
          author:  t.author,
          project: t.project,
          stars:   t.stars
        })));
      }
    } catch (e) { console.warn('Testimonials fetch failed', e); }

    // STATS
    try {
      const { data: stats, error } = await db.from('stats').select('*').limit(1).single();
      if (!error && stats) {
        const map = {
          projects: stats.projects_count,
          clients:  stats.clients_count,
          years:    stats.years_count,
          sqm:      stats.sqm_count
        };
        const keys = ['projects', 'clients', 'years', 'sqm'];
        document.querySelectorAll('.count-up').forEach((el, i) => {
          const key = keys[i];
          if (key && map[key] !== undefined && map[key] !== null) {
            el.dataset.target = map[key];
          }
        });
      }
    } catch (e) { console.warn('Stats fetch failed', e); }

    // Re-apply language after dynamic content renders
    applyLang(currentLang);
  }

  /* ── 1. LANGUAGE TOGGLE ─────────────────────── */
  const langToggle = document.getElementById('lang-toggle');
  let currentLang  = localStorage.getItem('lang') || 'ka';

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-ka]').forEach(el => {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
      el.textContent = lang === 'ka' ? el.dataset.ka : el.dataset.en;
    });

    document.querySelectorAll('[data-ka-placeholder]').forEach(el => {
      el.placeholder = lang === 'ka' ? el.dataset.kaPlaceholder : el.dataset.enPlaceholder;
    });

    // Show opposite language on the toggle button
    const label = document.querySelector('.lang-label');
    if (label) label.textContent = lang === 'ka' ? 'EN' : 'GE';

    // Keep filter buttons in sync
    document.querySelectorAll('.filter-btn[data-ka]').forEach(btn => {
      btn.textContent = lang === 'ka' ? btn.dataset.ka : btn.dataset.en;
    });

    localStorage.setItem('lang', lang);

    // Notify components that render DB-sourced bilingual fields (e.g. project names)
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      applyLang(currentLang === 'ka' ? 'en' : 'ka');
    });
  }

  applyLang(currentLang);


  /* ── 2. MOBILE MENU ─────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  function closeMenu() {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) closeMenu();
    });
  }


  /* ── 3. HEADER SCROLL BEHAVIOR ──────────────── */
  const header = document.getElementById('header');

  function onScroll() {
    const scrollY = window.scrollY;
    header?.classList.toggle('scrolled', scrollY > 40);

    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href')?.replace('#', '') === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ── 4. SMOOTH SCROLL ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH, behavior: 'smooth' });
    });
  });


  /* ── 5. INTERSECTION OBSERVER → REVEAL ──────── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ── 6. STATS COUNT-UP ──────────────────────── */
  function formatNumber(n) {
    return n >= 1000 ? n.toLocaleString() : String(n);
  }

  function animateCountUp(el, target, duration = 2000) {
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - (1 - progress) * (1 - progress);
      el.textContent = formatNumber(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.count-up').forEach(el => {
            animateCountUp(el, parseInt(el.dataset.target, 10));
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statsObserver.observe(statsSection);


  /* ── 7. PROJECT FILTER (no-op — section now uses circular scroll row) ── */


  /* ── 8. TESTIMONIALS CAROUSEL ───────────────── */
  const track   = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  let currentSlide = 0;
  let autoTimer = null;

  function getDots() {
    return document.querySelectorAll('.t-dot');
  }

  function getTotalSlides() {
    return getDots().length || 3;
  }

  function goToSlide(idx) {
    const total = getTotalSlides();
    currentSlide = (idx + total) % total;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    getDots().forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function startAuto() { stopAuto(); autoTimer = setInterval(() => goToSlide(currentSlide + 1), 4000); }
  function stopAuto()  { if (autoTimer) clearInterval(autoTimer); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAuto(); });

  // Wire initial static dots
  getDots().forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAuto(); }));

  if (track) {
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1); startAuto(); }
    }, { passive: true });
    const wrapper = document.querySelector('.testimonials-wrapper');
    wrapper?.addEventListener('mouseenter', stopAuto);
    wrapper?.addEventListener('mouseleave', startAuto);
  }

  startAuto();


  /* ── 9. CONTACT FORM ────────────────────────── */
  // Populate project dropdown
  (async () => {
    try {
      const { data: projectsForForm } = await db.from('projects').select('id, name_ka, name_en').order('created_at', { ascending: false });
      const select = document.getElementById('contact-project');
      if (select && projectsForForm) {
        projectsForForm.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.setAttribute('data-ka', p.name_ka);
          opt.setAttribute('data-en', p.name_en);
          opt.textContent = currentLang === 'ka' ? p.name_ka : p.name_en;
          select.appendChild(opt);
        });
      }
    } catch (e) { console.warn('project dropdown load error', e); }
  })();

  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const nameInput  = document.getElementById('contact-name');
      const phoneInput = document.getElementById('contact-phone');
      const errName    = document.getElementById('err-name');
      const errPhone   = document.getElementById('err-phone');

      const name  = nameInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';

      let valid = true;
      if (!name) {
        nameInput?.classList.add('error');
        errName?.classList.add('visible');
        valid = false;
      } else {
        nameInput?.classList.remove('error');
        errName?.classList.remove('visible');
      }
      if (!phone) {
        phoneInput?.classList.add('error');
        errPhone?.classList.add('visible');
        valid = false;
      } else {
        phoneInput?.classList.remove('error');
        errPhone?.classList.remove('visible');
      }
      if (!valid) return;

      const btn     = contactForm.querySelector('.btn-submit');
      const btnText = btn?.querySelector('.btn-text');
      const btnIcon = btn?.querySelector('.btn-icon');

      if (btn) btn.disabled = true;
      if (btnText) btnText.textContent = currentLang === 'ka' ? 'იგზავნება...' : 'Sending...';
      if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin btn-icon';

      const projectSelect = document.getElementById('contact-project');
      const projectName   = projectSelect?.options[projectSelect.selectedIndex]?.textContent || 'არ მაქვს შერჩეული';
      const message       = document.getElementById('contact-message')?.value.trim() || '';

      try {
        const { error } = await db.from('messages').insert([{ name, phone, project_name: projectName, message }]);
        if (error) console.warn('Message save failed', error);
      } catch (err) {
        console.warn('Message insert error', err);
      }

      setTimeout(() => {
        formSuccess.classList.add('visible');
        setTimeout(() => {
          formSuccess.classList.remove('visible');
          contactForm.reset();
          if (btn) btn.disabled = false;
          if (btnText) btnText.textContent = currentLang === 'ka' ? 'გაგზავნა' : 'Send Message';
          if (btnIcon) btnIcon.className = 'fa-solid fa-paper-plane btn-icon';
        }, 5000);
      }, 1200);
    });
  }


  /* ── 10. HERO SEARCH — Custom Dropdowns ─────── */

  const _csState = { city: 'თბილისი', price: 'any', payment: 'ყველა' };

  function _buildPanel(panelId, items, field) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.innerHTML = items.map(item => {
      const val   = item.value  !== undefined ? item.value  : item;
      const label = item.label  !== undefined ? item.label  : item;
      const sel   = val === _csState[field] ? ' cs-selected' : '';
      return `<div class="cs-option${sel}" data-value="${val}" onclick="csSelect('${field}','${val}','${label.replace(/'/g,"\\'")}',this)">${label}</div>`;
    }).join('');
  }

  (function initCustomSearch() {
    if (typeof NB_CONSTANTS === 'undefined') return;
    _buildPanel('cs-city-panel',    NB_CONSTANTS.cities,       'city');
    _buildPanel('cs-price-panel',   NB_CONSTANTS.priceRanges,  'price');
    _buildPanel('cs-payment-panel', NB_CONSTANTS.paymentTypes, 'payment');
  })();

  window.csToggle = function(field) {
    const wrap = document.getElementById('csf-' + field);
    if (!wrap) return;
    const isOpen = wrap.classList.contains('cs-open');
    // Close all
    document.querySelectorAll('.cs-field.cs-open').forEach(el => el.classList.remove('cs-open'));
    if (!isOpen) wrap.classList.add('cs-open');
  };

  window.csSelect = function(field, value, label, optEl) {
    _csState[field] = value;
    const valEl = document.getElementById('cs-' + field + '-val');
    if (valEl) valEl.textContent = label;
    // Mark selected in panel
    optEl.closest('.cs-panel').querySelectorAll('.cs-option').forEach(o => o.classList.remove('cs-selected'));
    optEl.classList.add('cs-selected');
    // Close
    document.getElementById('csf-' + field)?.classList.remove('cs-open');
  };

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.cs-field')) {
      document.querySelectorAll('.cs-field.cs-open').forEach(el => el.classList.remove('cs-open'));
    }
  });

  window.handleHeroSearch = function() {
    const params = new URLSearchParams({
      city:    _csState.city,
      price:   _csState.price,
      payment: _csState.payment
    });
    window.location.href = '/search?' + params.toString();
  };

  function showSearchToast(city, area, payment) {
    const existing = document.querySelector('.search-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'search-toast';
    toast.textContent = `${city} · ${area} · ${payment}`;
    toast.style.cssText = `
      position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
      background:#111; color:#fff; padding:12px 24px; border-radius:50px;
      font-size:14px; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.2);
      white-space:nowrap; font-family:inherit;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ── SERVICES ACCORDION ─────────────────────── */
  document.querySelectorAll('.svc-item').forEach(item => {
    item.querySelector('.svc-item-top').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.svc-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── FIRE SUPABASE INIT ─────────────────────── */
  initSite();

  /* ══════════════════════════════════════════════
     PROJECTS SECTION (filterable grid)
  ══════════════════════════════════════════════ */
  (function initProjects() {
    const grid     = document.getElementById('projects-grid');
    const tabs     = document.getElementById('projects-tabs');
    if (!grid || !tabs) return;

    const categoryLabel = {
      residential: { ka: 'საცხოვრებელი', en: 'Residential' },
      commercial:  { ka: 'კომერციული',   en: 'Commercial'  }
    };
    const statusLabel = {
      completed: { ka: 'დასრულებული', en: 'Completed' },
      ongoing:   { ka: 'მიმდინარე',   en: 'Ongoing'   }
    };

    let allProjects = [];
    let activeFilter = 'all';

    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
    }

    function pickName(p, lang) {
      if (lang === 'en') return p.name_en || p.name_ka || '';
      return p.name_ka || p.name_en || '';
    }

    function cardHTML(p, i, lang) {
      const status   = statusLabel[p.status] ? p.status : 'ongoing';
      const category = categoryLabel[p.category] ? p.category : '';
      const statusTx = statusLabel[status][lang];
      const catTx    = category ? categoryLabel[category][lang] : '';
      const name     = pickName(p, lang);
      const loc      = p.location || '';
      const gradClass = 'project-ph-' + (i % 3);

      const imgStyle = p.image_url
        ? `style="background-image:url('${esc(p.image_url)}')"`
        : '';
      const phInner  = p.image_url ? '' :
        `<div class="project-ph ${gradClass}"><i class="fa-solid fa-building"></i></div>`;

      const locInner = loc
        ? `<span class="project-location">
             <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5.5.75C3.015.75 1 2.706 1 5.119 1 8.484 5.5 12.25 5.5 12.25s4.5-3.766 4.5-7.131C10 2.706 7.985.75 5.5.75zm0 6.06a1.68 1.68 0 1 1 0-3.36 1.68 1.68 0 0 1 0 3.36z" fill="currentColor"/></svg>
             <span>${esc(loc)}</span>
           </span>`
        : `<span class="project-location"></span>`;

      return `
        <a class="project-card" href="/project?id=${esc(p.id)}" data-status="${status}">
          <div class="project-image" ${imgStyle}>
            ${phInner}
            <span class="project-badge project-badge-${status}">${esc(statusTx)}</span>
          </div>
          <div class="project-body">
            ${category ? `<div class="project-category">${esc(catTx)}</div>` : ''}
            <h3 class="project-name">${esc(name)}</h3>
            <div class="project-footer">
              ${locInner}
              <svg class="project-arrow" width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 6h15m0 0L11 1m5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
        </a>`;
    }

    function renderGrid() {
      if (!allProjects.length) {
        grid.innerHTML = `<div class="projects-empty" data-ka="ჯერ არ არის პროექტები" data-en="No projects yet">ჯერ არ არის პროექტები</div>`;
        if (typeof applyLang === 'function') applyLang(currentLang);
        return;
      }
      const lang = currentLang;
      grid.innerHTML = allProjects.map((p, i) => cardHTML(p, i, lang)).join('');
      applyFilter(activeFilter);
    }

    function updateCounts() {
      const total = allProjects.length;
      const completed = allProjects.filter(p => p.status === 'completed').length;
      const ongoing   = allProjects.filter(p => p.status === 'ongoing').length;
      const setCount = (key, n) => {
        const el = tabs.querySelector(`[data-count="${key}"]`);
        if (el) el.textContent = n;
      };
      setCount('all', total);
      setCount('completed', completed);
      setCount('ongoing', ongoing);
    }

    function applyFilter(filter) {
      activeFilter = filter;
      grid.querySelectorAll('.project-card').forEach(card => {
        const match = filter === 'all' || card.dataset.status === filter;
        card.classList.toggle('is-hidden', !match);
      });
    }

    tabs.addEventListener('click', e => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      tabs.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter);
    });

    // Re-render on language toggle (handles name_ka/name_en + labels)
    document.addEventListener('langchange', () => renderGrid());

    async function loadProjects() {
      try {
        const { data, error } = await db.from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) { console.warn('Projects fetch failed', error); return []; }
        return data || [];
      } catch (e) { console.warn('Projects fetch failed', e); return []; }
    }

    async function init() {
      allProjects = await loadProjects();
      updateCounts();
      renderGrid();
    }

    init();
  })();

  /* ══════════════════════════════════════════════
     PARTNERS SECTION
  ══════════════════════════════════════════════ */
  (function initPartners() {
    const grid   = document.getElementById('partners-grid');
    const detail = document.getElementById('partner-detail');
    if (!grid || !detail) return;

    let _partners = [];
    let _selectedId = null;

    function initials(name) {
      return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    function domainOnly(url) {
      try { return new URL(url).hostname.replace(/^www\./, ''); }
      catch { return url; }
    }

    function renderGrid(list) {
      if (!list.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#aaa;padding:32px 0">პარტნიორი არ მოიძებნა</p>';
        return;
      }
      grid.innerHTML = list.map(p => `
        <button class="partner-card${_selectedId === p.id ? ' active' : ''}"
                data-id="${p.id}"
                onclick="selectPartner('${p.id}')"
                aria-pressed="${_selectedId === p.id}"
                title="${p.name}">
          <div class="partner-logo-wrap">
            ${p.logo_url
              ? `<img src="${p.logo_url}" alt="${p.name}" loading="lazy" />`
              : `<span class="partner-initials">${initials(p.name)}</span>`}
          </div>
          <span class="partner-card-name">${p.name}</span>
        </button>
      `).join('');
    }

    function renderDetail(p) {
      if (!p) { detail.classList.remove('visible'); return; }
      const isActive = p.status === 'active';
      const badgeKa = isActive ? 'აქტიური' : 'ყოფილი';
      const badgeEn = isActive ? 'Active' : 'Past';
      const lang = localStorage.getItem('lang') || 'ka';
      detail.innerHTML = `
        <div class="partner-detail-inner">
          <div class="pdetail-logo">
            ${p.logo_url
              ? `<img src="${p.logo_url}" alt="${p.name}" />`
              : `<span class="pdetail-logo-initials">${initials(p.name)}</span>`}
          </div>
          <div class="pdetail-body">
            <div class="pdetail-top">
              <div>
                <div class="pdetail-name">${p.name}</div>
                <div class="pdetail-meta-line">${[p.industry, p.founded_year ? p.founded_year + ' წ.' : ''].filter(Boolean).join(' · ')}</div>
              </div>
              <span class="pdetail-badge${isActive ? '' : ' past'}">${lang === 'ka' ? badgeKa : badgeEn}</span>
            </div>
            ${p.description ? `<p class="pdetail-desc">${p.description}</p>` : ''}
            <div class="pdetail-stats">
              ${p.joint_projects_count ? `<div class="pdetail-stat"><span class="pdetail-stat-val">${p.joint_projects_count}</span><span class="pdetail-stat-label">ერთობლივი პროექტი</span></div>` : ''}
              ${p.partnership_years ? `<div class="pdetail-stat"><span class="pdetail-stat-val">${p.partnership_years} წელი</span><span class="pdetail-stat-label">თანამშრომლობა</span></div>` : ''}
              ${p.website ? `<div class="pdetail-stat"><a href="${p.website}" target="_blank" rel="noopener" class="pdetail-website">${domainOnly(p.website)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px"></i></a><span class="pdetail-stat-label">ვებსაიტი</span></div>` : ''}
            </div>
          </div>
        </div>`;
      detail.classList.add('visible');
    }

    window.selectPartner = function(id) {
      if (_selectedId === id) {
        _selectedId = null;
        detail.classList.remove('visible');
        renderGrid(_partners);
        return;
      }
      _selectedId = id;
      renderGrid(_partners);
      const p = _partners.find(x => x.id === id);
      renderDetail(p);
      // Scroll detail into view smoothly
      setTimeout(() => detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    };

    async function loadPartners() {
      try {
        const { data, error } = await db
          .from('partners')
          .select('*')
          .eq('status', 'active')
          .order('display_order', { ascending: true })
          .limit(8);
        return error ? [] : (data || []);
      } catch { return []; }
    }

    async function init() {
      _partners = await loadPartners();
      renderGrid(_partners);
    }

    init();
  })();

  /* ── FAQ SECTION ─────────────────────────────── */
  (function initFAQ() {
    const list = document.getElementById('faq-list');
    if (!list) return;

    const faqItems = [
      {
        q_ka: 'როდის დასრულდება NB Residence II?',
        q_en: 'When will NB Residence II be completed?',
        a_ka: 'NB Residence II ბათუმში 2026 წლის III კვარტალში დასრულდება. ფაზობრივი ჩაბარება იწყება 2026 წლის აგვისტოდან. დეტალური გრაფიკი და ფოტოანგარიში ხელმისაწვდომია პროექტის გვერდზე.',
        a_en: 'NB Residence II in Batumi will be completed in Q3 2026. Phased handover begins in August 2026. A detailed schedule and photo report are available on the project page.'
      },
      {
        q_ka: 'რა გადახდის ვარიანტები გაქვთ?',
        q_en: 'What payment options do you offer?',
        a_ka: 'გთავაზობთ 3 ძირითად ვარიანტს: სრული გადახდა ფასდაკლებით, შიდა განვადება 24-36 თვეზე წინასწარი შენატანით, და იპოთეკური სესხი პარტნიორი ბანკებიდან სწრაფი დამტკიცებით.',
        a_en: 'We offer 3 main options: full payment with a discount, internal installment over 24–36 months with an initial deposit, and mortgage loans from partner banks with fast approval.'
      },
      {
        q_ka: 'რომელ ბანკებთან თანამშრომლობთ იპოთეკით?',
        q_en: 'Which banks do you partner with for mortgages?',
        a_ka: 'თანამშრომლობთ საქართველოს წამყვან ბანკებთან. გაყიდვების გუნდი დაგეხმარებათ საუკეთესო პირობების მქონე ბანკის შერჩევაში თქვენი შემთხვევისთვის.',
        a_en: 'We work with the leading banks in Georgia. Our sales team will help you select the bank with the best terms for your specific case.'
      },
      {
        q_ka: 'როგორ შეიძლება ბინის დათვალიერება?',
        q_en: 'How can I visit an apartment?',
        a_ka: 'მშენებარე და დასრულებულ ობიექტებზე ვიზიტი ხდება წინასწარი ჩანიშვნით. დაგვიკავშირდით ტელეფონით ან მოგვწერეთ კონტაქტის ფორმის მეშვეობით — გაყიდვების მენეჯერი 24 საათში დაგიკავშირდებათ.',
        a_en: 'Visits to our under-construction and completed sites are by appointment. Contact us by phone or through the contact form — a sales manager will get back to you within 24 hours.'
      },
      {
        q_ka: 'რა გარანტიას იძლევით ხარისხზე?',
        q_en: 'What quality guarantees do you offer?',
        a_ka: 'ვსარგებლობთ 5-წლიანი სტრუქტურული გარანტიით ყველა საცხოვრებელ ობიექტზე და 2-წლიანი გარანტიით საინჟინრო სისტემებზე. ყოველი ბინა დოკუმენტირებულია ფოტო-ანგარიშით მშენებლობის ყოველ ეტაპზე.',
        a_en: 'We provide a 5-year structural guarantee on all residential properties and a 2-year guarantee on engineering systems. Each apartment is documented with a photo report for every stage of construction.'
      }
    ];

    const plusSvg = '<svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 1v8M1 5h8" stroke-width="1.8" stroke-linecap="round"/></svg>';

    list.innerHTML = faqItems.map((item, i) => `
      <div class="faq-item${i === 0 ? ' is-open' : ''}" data-index="${i}">
        <button class="faq-question" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="faq-answer-${i}">
          <span data-ka="${item.q_ka.replace(/"/g,'&quot;')}" data-en="${item.q_en.replace(/"/g,'&quot;')}">${item.q_ka}</span>
          <span class="faq-icon" aria-hidden="true">${plusSvg}</span>
        </button>
        <div class="faq-answer" id="faq-answer-${i}" role="region">
          <p data-ka="${item.a_ka.replace(/"/g,'&quot;')}" data-en="${item.a_en.replace(/"/g,'&quot;')}">${item.a_ka}</p>
        </div>
      </div>
    `).join('');

    // Accordion behavior — only one open at a time
    list.addEventListener('click', e => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('is-open');

      list.querySelectorAll('.faq-item.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Re-apply language to the freshly rendered nodes
    if (typeof applyLang === 'function') applyLang(currentLang);
  })();

})();
