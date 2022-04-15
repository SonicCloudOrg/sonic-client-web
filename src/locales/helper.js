export function setHtmlPageLang(locale) {
  document.querySelector('html')?.setAttribute('lang', locale);
}