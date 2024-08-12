export default defineNuxtRouteMiddleware((to, from) => {
  const state = useLoggedInState();

  if (!state.value) {
    return navigateTo(`/auth/sign-in?redirect_uri=${to.fullPath}`)
  }
})
