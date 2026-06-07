import { auth } from '~~/server/utils/auth'

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const cookieHeader = getRequestHeader(event, 'cookie') || ''
    
    if (!cookieHeader) {
      event.context.session = null
      return
    }
    
    // Parse the session token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    }, {} as Record<string, string>)
    
    const sessionToken = cookies['better-auth.session_token']
    if (!sessionToken) {
      event.context.session = null
      return
    }
    
    try {
      const session = await auth.api.getSession({
        headers: new Headers({ cookie: cookieHeader })
      })
      event.context.session = session
    } catch (error) {
      console.error('[Auth Plugin] Error getting session:', error)
      event.context.session = null
    }
  })
})
