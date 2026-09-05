// Evil Town — site behavior: i18n loading, language switch, mobile menu.

const STORAGE_KEY = 'evil-town-lang';
const SUPPORTED = ['en', 'ar'];
const DEFAULT_LANG = 'en';

const translations = {};
let currentLang = DEFAULT_LANG;

function getSavedLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
}

function resolve(key, dict) {
  return key.split('.').reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : null), dict);
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = resolve(el.getAttribute('data-i18n'), dict);
    if (value) el.textContent = value;
  });
}

function setDirection(lang) {
  const isRtl = lang === 'ar';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
}

function setSwitchState(lang) {
  document.querySelectorAll('[data-lang-label]').forEach((el) => {
    el.classList.toggle('is-active', el.getAttribute('data-lang-label') === lang);
  });
}

function applyLanguage(lang) {
  currentLang = lang;
  const dict = translations[lang] || translations[DEFAULT_LANG];
  if (dict) applyTranslations(dict);
  setDirection(lang);
  setSwitchState(lang);
  localStorage.setItem(STORAGE_KEY, lang);
}

async function fetchLang(lang) {
  try {
    const res = await fetch(`${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    translations[lang] = await res.json();
  } catch (err) {
    console.error(`Evil Town: could not load "${lang}.json" — check the file exists at the site root with that exact lowercase name.`, err);
  }
}

async function initLanguage() {
  const switchBtn = document.getElementById('langSwitch');

  // Wire the click handler immediately so the button is responsive
  // right away, independent of how long translations take to load.
  switchBtn.addEventListener('click', () => {
    const next = currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(next);
  });

  await Promise.all(SUPPORTED.map(fetchLang));
  applyLanguage(getSavedLang());
}

function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initMobileMenu();
});
