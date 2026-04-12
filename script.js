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

  function _renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = projects.map((p, i) => {
      const delay    = (i % 3) * 0.08;
      const isWide   = p.category === 'commercial';
      const isTall   = p.category === 'residential' && i % 2 === 0;
      const badgeCls = p.status === 'completed' ? 'completed' : 'ongoing';
      const badgeKa  = p.status === 'completed' ? 'დასრულებული' : 'მიმდინარე';
      const badgeEn  = p.status === 'completed' ? 'Completed' : 'Ongoing';
      const typeKa   = p.category === 'residential' ? 'საცხოვრებელი კომპლექსი' : 'კომერციული ცენტრი';
      const typeEn   = p.category === 'residential' ? 'Residential Complex' : 'Commercial Center';
      const pvClass  = isWide ? 'pv-wide' : isTall ? 'pv-tall' : '';
      const thumbStyle = p.imageUrl
        ? `style="background-image:url('${p.imageUrl}');background-size:cover;background-position:center"`
        : '';
      return `
        <div class="project-card reveal" data-category="${p.category}" style="--delay:${delay}s;cursor:pointer" onclick="window.location.href='/project?id=${p.id}'">
          <div class="project-thumb" ${thumbStyle}>
            ${!p.imageUrl ? `<div class="project-visual">
              <div class="pv-building ${pvClass}">
                <div class="pv-b-body"></div>
                ${!isWide ? '<div class="pv-b-top"></div>' : ''}
                <div class="pv-b-windows">
                  <div class="pv-row"><span></span><span></span><span></span></div>
                  <div class="pv-row"><span></span><span></span><span></span></div>
                  <div class="pv-row"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>` : ''}
            <div class="project-overlay">
              <a href="/project?id=${p.id}" class="btn-primary btn-sm" data-ka="დეტალები" data-en="Details">დეტალები</a>
            </div>
          </div>
          <div class="project-info">
            <div class="project-meta">
              <span class="project-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
              <span class="project-badge ${badgeCls}" data-ka="${badgeKa}" data-en="${badgeEn}">${badgeKa}</span>
            </div>
            <h3 class="project-name" data-ka="${p.nameKa}" data-en="${p.nameEn}">${p.nameKa}</h3>
            <p class="project-type" data-ka="${typeKa}" data-en="${typeEn}">${typeKa}</p>
          </div>
        </div>`;
    }).join('');

    // Re-observe newly rendered cards
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

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
    // PROJECTS
    try {
      const { data: projects, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && projects && projects.length) {
        _renderProjects(projects.map(p => ({
          id:       p.id,
          nameKa:   p.name_ka,
          nameEn:   p.name_en,
          category: p.category,
          location: p.location,
          status:   p.status,
          imageUrl: p.image_url
        })));
      }
    } catch (e) { console.warn('Projects fetch failed', e); }

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
  const langKaEl   = document.querySelector('.lang-ka');
  const langEnEl   = document.querySelector('.lang-en');
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

    if (langKaEl && langEnEl) {
      langKaEl.classList.toggle('active', lang === 'ka');
      langEnEl.classList.toggle('active', lang === 'en');
    }

    // Keep filter buttons in sync
    document.querySelectorAll('.filter-btn[data-ka]').forEach(btn => {
      btn.textContent = lang === 'ka' ? btn.dataset.ka : btn.dataset.en;
    });

    localStorage.setItem('lang', lang);
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


  /* ── 7. PROJECT FILTER ──────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !show);
        if (show) {
          card.classList.add('fade-in');
          setTimeout(() => card.classList.remove('fade-in'), 400);
        }
      });
    });
  });


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


  /* ── 10. HERO SEARCH ───────────────────────── */

  // Populate selects from NB_CONSTANTS
  (function populateHeroSearch() {
    const cityEl    = document.getElementById('h-city');
    const priceEl   = document.getElementById('h-price');
    const paymentEl = document.getElementById('h-payment');
    if (!cityEl || typeof NB_CONSTANTS === 'undefined') return;
    cityEl.innerHTML    = NB_CONSTANTS.cities.map(c => `<option value="${c}">${c}</option>`).join('');
    priceEl.innerHTML   = NB_CONSTANTS.priceRanges.map(r => `<option value="${r.value}">${r.label}</option>`).join('');
    paymentEl.innerHTML = NB_CONSTANTS.paymentTypes.map(p => `<option value="${p}">${p}</option>`).join('');
  })();

  window.handleHeroSearch = function() {
    const city    = document.getElementById('h-city')?.value    || '';
    const price   = document.getElementById('h-price')?.value   || '';
    const payment = document.getElementById('h-payment')?.value || '';
    const params  = new URLSearchParams({ city, price, payment });
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

  /* ── FIRE SUPABASE INIT ─────────────────────── */
  initSite();

})();
