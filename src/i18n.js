// Langue du site : ?lang=en|fr, sinon le choix mémorisé, sinon la langue du navigateur.
const q = new URLSearchParams(location.search).get('lang');
let saved = null;
try { saved = localStorage.getItem('lang'); } catch {}
export const lang = q === 'en' || q === 'fr' ? q : saved || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en');
try { if (q === 'en' || q === 'fr') localStorage.setItem('lang', q); } catch {}
export const en = lang === 'en';
export const t = (fr, enText) => (en ? enText : fr);

export function switchLang() {
  const next = en ? 'fr' : 'en';
  try { localStorage.setItem('lang', next); } catch {}
  const u = new URL(location.href);
  u.searchParams.set('lang', next);
  location.href = u.toString();
}

// Textes fixes de index.html, repérés par data-i18n
const staticEn = {
  title: 'Miled Cherif — Developer and cybersecurity analyst',
  description: 'Miled Cherif builds security platforms for Hôpital Montfort, business SaaS products, websites and games.',
  'hero-text': 'Programmer analyst at Hôpital Montfort, I build secure, useful and thoughtfully designed software. Each island in this world shows a facet of my work, from cybersecurity to creativity.',
  'hero-cta': 'Visit the four worlds',
  'contact-title': 'A project to build or to secure?',
  'contact-text': 'Business platform, risk analysis, website or game: I reply fast.',
  close: 'Close',
};
export function applyStatic() {
  document.documentElement.lang = lang;
  const toggle = document.querySelector('.lang');
  if (toggle && en) {
    toggle.querySelector('span').textContent = 'FR';
    toggle.href = '?lang=fr'; toggle.hreflang = 'fr'; toggle.lang = 'fr';
    toggle.setAttribute('aria-label', 'Version française');
  }
  if (!en) return;
  document.title = staticEn.title;
  document.querySelector('meta[name=description]')?.setAttribute('content', staticEn.description);
  document.querySelectorAll('[data-i18n]').forEach((el) => { const v = staticEn[el.dataset.i18n]; if (v) el.textContent = v; });
  const close = document.querySelector('#project .close');
  if (close) close.setAttribute('aria-label', 'Close the project sheet');
  const mail = document.querySelector('.contact-actions a[href^=mailto]');
  if (mail) mail.href = 'mailto:mod.cherif@gmail.com?subject=Project%20to%20discuss';
}
