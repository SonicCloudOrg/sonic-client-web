/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
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