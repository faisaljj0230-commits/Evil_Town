// Evil Town — site behavior: i18n loading, language switch, mobile menu.

const STORAGE_KEY = 'evil-town-lang';
const SUPPORTED = ['en', 'ar'];
const DEFAULT_LANG = 'en';

let translations = {};

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

async function loadLanguage(lang) {
  if (!translations[lang]) {
    const res = await fetch(`lang/${lang}.json`);
    translations[lang] = await res.json();
  }
  applyTranslations(translations[lang]);
  setDirection(lang);
  setSwitchState(lang);
  localStorage.setItem(STORAGE_KEY, lang);
}

function initLanguage() {
  loadLanguage(getSavedLang());

  document.getElementById('langSwitch').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('lang') || DEFAULT_LANG;
    const next = current === 'en' ? 'ar' : 'en';
    loadLanguage(next);
  });
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
