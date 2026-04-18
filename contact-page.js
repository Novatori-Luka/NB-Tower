/* =============================================
   contact.html — form submission + project dropdown
   Relies on script.js for:
     - applyLang() / currentLang (via langchange event)
     - window.submitContactForm(formData, source)
   ============================================= */

(function initContactPage() {
  'use strict';

  const form       = document.getElementById('cp-contact-form');
  const success    = document.getElementById('cp-form-success');
  const formError  = document.getElementById('cp-form-error');
  const select     = document.getElementById('cp-project');
  if (!form || !select) return;

  const getLang = () => (localStorage.getItem('lang') || 'ka');

  /* ── Project dropdown ── Fetch live projects and rebuild options per lang */
  let _projects = [];

  function renderProjectOptions() {
    const lang = getLang();
    const defaultLabel = lang === 'ka' ? 'არ მაქვს შერჩეული' : 'None selected';
    // Preserve selection across re-render
    const prevValue = select.value;
    select.innerHTML =
      `<option value="" data-ka="არ მაქვს შერჩეული" data-en="None selected">${defaultLabel}</option>` +
      _projects.map(p => {
        const name = lang === 'ka' ? (p.name_ka || p.name_en || '') : (p.name_en || p.name_ka || '');
        const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        return `<option value="${esc(p.id)}" data-ka="${esc(p.name_ka || '')}" data-en="${esc(p.name_en || '')}">${esc(name)}</option>`;
      }).join('');
    if (prevValue) select.value = prevValue;
  }

  (async function loadProjects() {
    try {
      const { data, error } = await db.from('projects')
        .select('id, name_ka, name_en')
        .order('created_at', { ascending: false });
      if (!error && data) {
        _projects = data;
        renderProjectOptions();
      }
    } catch (e) { console.warn('contact page: projects load failed', e); }
  })();

  document.addEventListener('langchange', renderProjectOptions);

  /* ── Form submit ── */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const lang = getLang();
    const nameEl    = document.getElementById('cp-name');
    const phoneEl   = document.getElementById('cp-phone');
    const emailEl   = document.getElementById('cp-email');
    const messageEl = document.getElementById('cp-message');
    const errName   = document.getElementById('cp-err-name');
    const errPhone  = document.getElementById('cp-err-phone');

    const name    = nameEl?.value.trim()    || '';
    const phone   = phoneEl?.value.trim()   || '';
    const email   = emailEl?.value.trim()   || '';
    const message = messageEl?.value.trim() || '';

    // Validate
    let valid = true;
    if (!name)  { nameEl?.classList.add('error');  errName?.classList.add('visible');  valid = false; }
    else        { nameEl?.classList.remove('error'); errName?.classList.remove('visible'); }
    if (!phone) { phoneEl?.classList.add('error'); errPhone?.classList.add('visible'); valid = false; }
    else        { phoneEl?.classList.remove('error'); errPhone?.classList.remove('visible'); }
    if (!valid) return;

    const projectLabel = select.options[select.selectedIndex]?.textContent
                         || (lang === 'ka' ? 'არ მაქვს შერჩეული' : 'None selected');

    const btn = form.querySelector('.cp-submit');
    const originalText = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = lang === 'ka' ? 'იგზავნება...' : 'Sending...';
    }
    formError?.classList.remove('visible');

    // Use shared helper exposed by script.js
    if (typeof window.submitContactForm !== 'function') {
      console.error('submitContactForm helper not loaded');
      formError?.classList.add('visible');
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      return;
    }

    const result = await window.submitContactForm(
      { name, phone, email, project: projectLabel, message },
      'contact_page'
    );

    if (result.success) {
      form.style.display = 'none';
      success?.classList.add('visible');
    } else {
      formError?.classList.add('visible');
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  });
})();
