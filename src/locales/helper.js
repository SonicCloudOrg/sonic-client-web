export function setHtmlPageLang(locale) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

// 读取浏览器语言
export function getSystemLanguage() {
  let lang = navigator.language || navigator.userLanguage; // 浏览器兼容
  return lang.replace('-', '_')
}