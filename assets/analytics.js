/* Magnus Growth — behavioral event tracking.
   GA4 & Clarity are initialized in <head>.
   Never send form values, contact details or Telegram message text to analytics. */
(() => {
  'use strict';
  const startedForms = new Set();
  const reportedScroll = new Set();
  const thresholds = [25, 50, 75, 90];
  let scrollQueued = false;
  function event(name, detail) {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(name)) return;
    // Only fixed event names and numeric proof / scroll labels; no applicant data.
    if (typeof window.gtag === 'function') window.gtag('event', name, detail || {});
    if (typeof window.clarity === 'function') window.clarity('event', name);
  }
  window.NinjaAnalytics = Object.freeze({ event, enabled: () => true });

  // Only semantic event identifiers are sent; no personal input or field content.
  document.addEventListener('focusin', e => {
    if (!e.target || !e.target.closest) return;
    const form = e.target.closest('form');
    if (!form) return;
    const key = form.id === 'applicationForm' ? 'job' :
      form.id === 'competitionForm' ? 'competition' : '';
    if (!key || startedForms.has(key) || !e.target.matches('input,select,textarea')) return;
    if (e.target.name === 'companySite') return;
    startedForms.add(key);
    event(key + '_form_start');
  }, true);

  // Submit means a Telegram message draft was requested, not that a message was sent.
  document.addEventListener('submit', e => {
    const f = e.target;
    const key = f && f.id === 'applicationForm' ? 'job' :
      f && f.id === 'competitionForm' ? 'competition' : '';
    if (!key) return;
    if (!f.checkValidity()) { event(key + '_form_invalid'); return; }
    const honeypot = f.querySelector('[name="companySite"]');
    if (honeypot && honeypot.value) return;
    event(key + '_telegram_draft_click');
  }, true);

  document.addEventListener('click', e => {
    if (!e.target || !e.target.closest) return;
    const el = e.target.closest('a,button');
    if (!el) return;
    if (el.classList.contains('proof-open')) {
      const path = el.getAttribute('data-proof') || '';
      const match = path.match(/win-(\d{2})\.webp/);
      event('proof_image_open', { proof_number: match ? Number(match[1]) : 0 });
      return;
    }
    if (el.id === 'copyButton') event('job_copy_click');
    else if (el.id === 'cpCopyButton') event('competition_copy_click');
    else if (el.id === 'pathJob') event('job_nav_click');
    else if (el.id === 'pathCompete') event('competition_nav_click');
    else if (el.id === 'competeJoinLink') event('competition_form_cta_click');
    else if (el.getAttribute('href') === '#apply') event('job_cta_click');
    else if (el.getAttribute('href') === '#join-competition') event('competition_cta_click');
    else if (el.getAttribute('href') === '#competition-wins') event('proof_gallery_cta_click');
  }, true);

  function checkScrollDepth() {
    
    const root = document.documentElement, body = document.body;
    const total = Math.max(root.scrollHeight, body.scrollHeight) - window.innerHeight;
    if (total <= 0) return;
    const percent = Math.min(100, Math.max(0, 100 * (window.scrollY || root.scrollTop) / total));
    thresholds.forEach(t => {
      if (percent >= t && !reportedScroll.has(t)) {
        reportedScroll.add(t);
        event('scroll_' + t, { percent_scrolled: t });
      }
    });
  }
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => { scrollQueued = false; checkScrollDepth(); });
  }, { passive: true });
  window.addEventListener('resize', checkScrollDepth, { passive: true });
})();
