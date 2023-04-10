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
 * 全局统一配置参数
 */
export const LOCALE = {
  ZH_CN: 'zh_CN',
  EN_US: 'en_US',
  ZH_TW: 'zh_TW',
  JA_JP: 'ja_JP',
  // ...更多语言
};

export const localeList = [
  {
    text: '简体中文',
    building: false,
    event: LOCALE.ZH_CN,
  },
  {
    text: '繁體中文',
    building: true,
    event: LOCALE.ZH_TW,
  },
  {
    text: 'English',
    building: true,
    event: LOCALE.EN_US,
  },
  {
    text: '日本語',
    building: true,
    event: LOCALE.JA_JP,
  },
  // ...更多语言
];

export const localeSetting = {
  showPicker: true,
  // Locale
  locale: LOCALE.EN_US,
  // available Locales
  availableLocales: [LOCALE.ZH_CN, LOCALE.EN_US, LOCALE.ZH_TW, LOCALE.JA_JP], // ...更多语言
};
