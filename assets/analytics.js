/* Magnus Growth / Ninja — consent-gated analytics.
   GA4: G-00J1364DR1 | Clarity: z6gz4nvssg.
   Never send applicant form values, phone numbers or Telegram draft text to analytics. */
(() => {
  'use strict';
  const GA_ID = 'G-00J1364DR1';
  const CLARITY_ID = 'z6gz4nvssg';
  const PREF_KEY = 'ninja_analytics_consent_v1';
  const banner = document.getElementById('trackingConsent');
  const accept = document.getElementById('trackingAccept');
  const decline = document.getElementById('trackingDecline');
  const preferences = document.getElementById('trackingSettings');
  if (!banner || !accept || !decline || !preferences) return;
  let enabled = false, started = false, scrollQueued = false;
  const startedForms = new Set();
  const reportedScroll = new Set();
  const thresholds = [25, 50, 75, 90];

  function readPreference() {
    try { return localStorage.getItem(PREF_KEY); } catch (_) { return null; }
  }
  function storePreference(v) {
    try { localStorage.setItem(PREF_KEY, v); } catch (_) { /* Storage may be disabled */ }
  }
  function showBanner(show) {
    banner.hidden = !show;
    banner.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
  function event(name, detail) {
    if (!enabled || !/^[a-z][a-z0-9_]{0,39}$/.test(name)) return;
    if (typeof window.gtag === 'function') window.gtag('event', name, detail || {});
    if (typeof window.clarity === 'function') window.clarity('event', name);
  }
  window.NinjaAnalytics = Object.freeze({ event, enabled: () => enabled });

  function start() {
    if (started) { enabled = true; return; }
    started = true; enabled = true;
    // Consent is initialized to denied in <head> before this file executes.
    // Basic Consent Mode: Google and Clarity scripts are loaded only after opt-in.
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      allow_google_signals: false, allow_ad_personalization_signals: false
    });
    const google = document.createElement('script');
    google.async = true;
    google.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(google);

    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    const clarity = document.createElement('script');
    clarity.async = true;
    clarity.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
    document.head.appendChild(clarity);
  }
  function selectPreference(choice) {
    storePreference(choice);
    showBanner(false);
    if (choice === 'accepted') {
      start();
    } else if (started) {
      enabled = false;
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied', ad_storage: 'denied',
          ad_user_data: 'denied', ad_personalization: 'denied'
        });
      }
      if (typeof window.clarity === 'function') {
        window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      }
      // Stop scripts for the rest of the visit.
      window.location.reload();
    }
  }
  accept.addEventListener('click', () => selectPreference('accepted'));
  decline.addEventListener('click', () => selectPreference('declined'));
  preferences.addEventListener('click', () => {
    showBanner(true);
    banner.focus();
  });
  if (readPreference() === 'accepted') start();
  else if (readPreference() !== 'declined') showBanner(true);

  // Only semantic event identifiers are sent; no personal input or field content.
  document.addEventListener('focusin', e => {
    if (!enabled || !e.target || !e.target.closest) return;
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
    if (!enabled || !e.target || !e.target.closest) return;
    const el = e.target.closest('a,button');
    if (!el || el.closest('#trackingConsent') || el.id === 'trackingSettings') return;
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
    if (!enabled) return;
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
    if (scrollQueued || !enabled) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => { scrollQueued = false; checkScrollDepth(); });
  }, { passive: true });
  window.addEventListener('resize', checkScrollDepth, { passive: true });
})();
