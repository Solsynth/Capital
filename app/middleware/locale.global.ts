export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const locale = to.params.lang as string
  if (locale) {
    document.documentElement.lang = locale
  }
})
