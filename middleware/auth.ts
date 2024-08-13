export default defineNuxtRouteMiddleware((to, from) => {
  const id = useUserinfo();

  if (!id.isLoggedIn) {
    return navigateTo(`/auth/sign-in?redirect_uri=${to.fullPath}`)
  }
})
