export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    // Server-side: use direct database access
    const session = await useServerSession()
    if (!session) {
      return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
    }
  } else {
    // Client-side: use HTTP request
    const { data: session } = await useAuth().useSession(useFetch)
    if (!session.value) {
      return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
    }
  }
})
