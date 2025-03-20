export default defineNuxtRouteMiddleware((to) => {
  // No further supported path prefix localization
  if (to.path.startsWith("/zh-CN")) {
    return navigateTo(to.fullPath.replace("/zh-CN", ""))
  }
})
