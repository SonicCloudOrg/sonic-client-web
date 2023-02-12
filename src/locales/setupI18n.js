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
// locales/i18n.ts
import { createI18n } from 'vue-i18n';
import { getLocal } from '@/utils/cache/localStorage';
import { LOCALE_KEY } from '@/config/cache';
import { LOCALE, localeSetting } from '@/config/locale';
// 按需引入组件库语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import zhTW from 'element-plus/es/locale/lang/zh-tw';
import en from 'element-plus/es/locale/lang/en';
import ja from 'element-plus/es/locale/lang/ja';
import { setHtmlPageLang, getSystemLanguage, supportLanguage } from './helper';
// ...更多语言

const langDefault = localeSetting.locale;
let localeData = null;

function defaultLanguage() {
  const systemLocale = getSystemLanguage();
  // 查找顺序：浏览器缓存、浏览器系统、默认
  return (
    getLocal(LOCALE_KEY)?.locale || supportLanguage(systemLocale) || langDefault
  );
}

async function createI18nOptions() {
  const locale = defaultLanguage();
  const defaultLocal = await import(`./lang/${locale}.js`);
  const message = defaultLocal.default?.message ?? {};
  localeData = message;

  setHtmlPageLang(locale);

  return {
    legacy: false, // composition API
    locale,
    messages: {
      [locale]: message,
    },
  };
}

export let i18n = null;

// 获取组件库语言包
export function getElementPlusLocale() {
  const locale = defaultLanguage();
  const localeMap = {
    [LOCALE.ZH_CN]: zhCn,
    [LOCALE.ZH_TW]: zhTW,
    [LOCALE.EN_US]: en,
    [LOCALE.JA_JP]: ja,
    // ...更多语言
  };
  return localeMap[locale];
}

// 本地文件匹配
export function $tc(params) {
  if (!localeData) {
    throw new Error('not init localeData!');
  }
  const arr = typeof params === 'string' ? params.split('.') : [];
  let data = localeData;
  for (let i = 0; i < arr.length; i++) {
    data = data[arr[i]];
  }
  return data;
}

export async function setupI18n(app) {
  const options = await createI18nOptions();
  i18n = createI18n(options);
  app.use(i18n);
}
