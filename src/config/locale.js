/**
 * 全局统一配置参数
 */
export const LOCALE = {
  ZH_CN: 'zh_CN',
  EN_US: 'en',
};

export const localeList = [
  {
    text: '简体中文',
    event: LOCALE.ZH_CN,
  },
  {
    text: 'English',
    event: LOCALE.EN_US,
  },
];

export const localeSetting = {
  showPicker: true,
  // Locale
  locale: LOCALE.ZH_CN,
  // available Locales
  availableLocales: [LOCALE.ZH_CN, LOCALE.EN_US],
};