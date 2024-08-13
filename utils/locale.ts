export function getLocale() {
  const fallbackLocale = "en"
  const supportedLocales = ["en", "zh-CN"]
  const { locale } = useI18n()

  return supportedLocales.includes(locale.value) ? locale.value : fallbackLocale;
}
