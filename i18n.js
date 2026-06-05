const i18n = (() => {
  let currentLang = localStorage.getItem('openassets_lang') || 'en';
  let locales = {};
  let isReady = false;

  async function init() {
    try {
      const res = await fetch('locales.json');
      locales = await res.json();
      isReady = true;
      applyLanguage(currentLang);
    } catch (e) {
      console.error('i18n: Failed to load locales', e);
      isReady = true;
    }
  }

  function t(key, fallback = key) {
    if (!isReady) return fallback;
    return locales[currentLang]?.[key] ?? locales['en']?.[key] ?? fallback;
  }

  function getLocalized(item, field, fallback = null) {
    if (!isReady || !item) return fallback ?? '';
    return item?.i18n?.[currentLang]?.[field] ??
           item?.i18n?.['en']?.[field] ??
           item[field] ??
           fallback ?? '';
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('openassets_lang', lang);
    applyLanguage(lang);
  }

  function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const fallback = el.dataset.i18nFallback || key;
      el.innerHTML = t(key, fallback);
    });
    // Handle placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const fallback = el.dataset.i18nPlaceholderFallback || key;
      el.placeholder = t(key, fallback);
    });
    if (typeof window.onI18nLanguageChange === 'function') {
      window.onI18nLanguageChange(lang);
    }
  }

  return { init, t, getLocalized, setLanguage, lang: () => currentLang };
})();
