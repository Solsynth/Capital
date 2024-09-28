export function getLocale(locale?: any) {
  const fallbackLocale = "en"
  const supportedLocales = ["en", "zh-CN"]
  if (locale == null) {
    locale = useI18n().locale
  }

  return supportedLocales.includes(locale.value) ? locale.value : fallbackLocale
}
