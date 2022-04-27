/**
 * Multi-language related operations
 */
import { unref } from 'vue';
import { i18n } from './setupI18n';
import { setHtmlPageLang } from './helper'

function setI18nLanguage(locale) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    i18n.global.locale.value = locale;
  }
  setHtmlPageLang(locale);
}

export default function useLocale(store) {
  const getLocale = store.getters.getLocale;
  
  async function changeLocale(locale) {
    const globalI18n = i18n.global;
    const currentLocale = unref(globalI18n.locale);
    // 语言相同不做处理
    if (currentLocale === locale) {
      return locale;
    }

    const langModule = (await import(`./lang/${locale}.js`)).default;
    if (!langModule) return;

    const { message } = langModule;

    store.dispatch('changeLocaleInfo', { locale })
    globalI18n.setLocaleMessage(locale, message);
    setI18nLanguage(locale);
    // 强刷当前页面
    location.reload()
    return locale;
  }

  return {
    changeLocale,
    getLocale
  };
}