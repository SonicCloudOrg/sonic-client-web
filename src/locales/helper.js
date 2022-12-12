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
import { LOCALE } from '@/config/locale';

export function setHtmlPageLang(locale) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

// 读取浏览器语言
export function getSystemLanguage() {
  const lang = navigator.language || navigator.userLanguage; // 浏览器兼容
  return lang.replace('-', '_');
}

// 是否支持该语言
export function supportLanguage(lang) {
  const localeList = Object.values(LOCALE);
  return localeList.includes(lang) ? lang : '';
}
