/* =============================================
   NB TOWER — script.js
   ============================================= */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     0. LOCALSTORAGE → LIVE SITE SYNC
     Runs first so rendered elements are in DOM
     before observers and language toggle fire.
  ══════════════════════════════════════════════ */

  // Track site visits
  const _visits = parseInt(localStorage.getItem('nb_visits') || '0') + 1;
  localStorage.setItem('nb_visits', String(_visits));

  // Render projects from admin if saved
  const _storedProjects = _parseLS('nb_projects');
  if (_storedProjects && _storedProjects.length) {
    _renderProjects(_storedProjects);
  }

  // Render team from admin if saved
  const _storedTeam = _parseLS('nb_team');
  if (_storedTeam && _storedTeam.length) {
    _renderTeam(_storedTeam);
  }

  // Render testimonials from admin if saved
  const _storedTestimonials = _parseLS('nb_testimonials');
  if (_storedTestimonials && _storedTestimonials.length) {
    _renderTestimonials(_storedTestimonials);
  }

  // Update stat targets from admin if saved
  const _storedStats = _parseLS('nb_stats');
  if (_storedStats) {
    const _countEls = document.querySelectorAll('.count-up');
    const _keys = ['projects', 'clients', 'years', 'sqm'];
    _countEls.forEach((el, i) => {
      if (_keys[i] && _storedStats[_keys[i]] !== undefined) {
        el.dataset.target = _storedStats[_keys[i]];
      }
    });
  }

  function _parseLS(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }

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
        <div class="project-card reveal" data-category="${p.category}" style="--delay:${delay}s">
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
              <a href="#contact" class="btn-primary btn-sm" data-ka="დეტალები" data-en="Details">დეტალები</a>
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

  // Observes both original and localStorage-rendered elements
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
      // Query dynamically so localStorage-rendered cards are included
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
  const dots    = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  let currentSlide = 0;
  const totalSlides = dots.length || 3;
  let autoTimer = null;

  function goToSlide(idx) {
    currentSlide = (idx + totalSlides) % totalSlides;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function startAuto() { stopAuto(); autoTimer = setInterval(() => goToSlide(currentSlide + 1), 4000); }
  function stopAuto()  { if (autoTimer) clearInterval(autoTimer); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAuto(); }));

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
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const btn     = contactForm.querySelector('.btn-submit');
      const btnText = btn?.querySelector('.btn-text');
      const btnIcon = btn?.querySelector('.btn-icon');

      if (btn) btn.disabled = true;
      if (btnText) btnText.textContent = currentLang === 'ka' ? 'იგზავნება...' : 'Sending...';
      if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin btn-icon';

      // Save to localStorage for admin panel
      const submission = {
        id:      Date.now().toString(36) + Math.random().toString(36).slice(2),
        name:    contactForm.querySelector('#name').value.trim(),
        email:   contactForm.querySelector('#email').value.trim(),
        phone:   contactForm.querySelector('#phone').value.trim(),
        message: contactForm.querySelector('#message').value.trim(),
        date:    new Date().toISOString(),
        read:    false,
      };
      try {
        const existing = JSON.parse(localStorage.getItem('nb_messages') || '[]');
        existing.push(submission);
        localStorage.setItem('nb_messages', JSON.stringify(existing));
      } catch (_) {}

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

})();
