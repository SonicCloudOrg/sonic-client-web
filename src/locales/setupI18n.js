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
// locales/i18n.ts
import {createI18n} from 'vue-i18n';
import {getLocal} from '@/utils/cache/localStorage'
import {LOCALE_KEY} from '@/config/cache'
import {LOCALE} from '@/config/locale'
import {setHtmlPageLang, getSystemLanguage, supportLanguage} from './helper'
// 按需引入组件库语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import zhTW from 'element-plus/es/locale/lang/zh-tw'
import en from 'element-plus/es/locale/lang/en'
import ja from 'element-plus/es/locale/lang/ja'
// ...更多语言

const langDefault = LOCALE.ZH_CN
let localeData = null

function defaultLanguage() {
    const systemLocale = getSystemLanguage()
    // 查找顺序：浏览器缓存、浏览器系统、默认
    return getLocal(LOCALE_KEY)?.locale || supportLanguage(systemLocale) || langDefault
}

async function createI18nOptions() {
    const locale = defaultLanguage()
    const defaultLocal = await import(`./lang/${locale}.js`);
    const message = defaultLocal.default?.message ?? {};
    localeData = message
    
    setHtmlPageLang(locale);

    return {
        legacy: false, // composition API
        locale,
        messages: {
            [locale]: message,
        }
    };
}

export let i18n = null

// 获取组件库语言包
export function getElementPlusLocale() {
    const locale = defaultLanguage()
    const localeMap = {
        [LOCALE.ZH_CN]: zhCn,
        [LOCALE.ZH_TW]: zhTW,
        [LOCALE.EN_US]: en,
        [LOCALE.JA_JP]: ja
        // ...更多语言
    }
    return localeMap[locale]
}

// 本地文件匹配
export function $tc(params) {
  if (!localeData) {
    throw new Error('not init localeData!')
  }
  const arr = typeof params === 'string' ? params.split('.') : []
  let data = localeData
  for (let i = 0; i < arr.length; i++) {
    data = data[arr[i]]
  }
  return data
}

export async function setupI18n(app) {
    const options = await createI18nOptions();
    i18n = createI18n(options);
    app.use(i18n);
}
