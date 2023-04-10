/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Multi-language related operations
 */
import { unref } from 'vue';
import { i18n } from './setupI18n';
import { setHtmlPageLang } from './helper';

function setI18nLanguage(locale) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    i18n.global.locale.value = locale;
  }
  setHtmlPageLang(locale);
}

export default function useLocale(store) {
  const { getLocale } = store.getters;

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

    store.dispatch('changeLocaleInfo', { locale });
    globalI18n.setLocaleMessage(locale, message);
    setI18nLanguage(locale);
    // 强刷当前页面
    location.reload();
    return locale;
  }

  return {
    changeLocale,
    getLocale,
  };
}
