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
import { LOCALE } from '@/config/locale'

export function setHtmlPageLang(locale) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

// 读取浏览器语言
export function getSystemLanguage() {
  let lang = navigator.language || navigator.userLanguage; // 浏览器兼容
  return lang.replace('-', '_')
}

// 是否支持该语言
export function supportLanguage(lang) {
  const localeList = Object.values(LOCALE)
  return localeList.includes(lang) ? lang : ''
}