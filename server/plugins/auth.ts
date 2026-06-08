import { auth } from '~~/server/utils/auth'

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const cookieHeader = getRequestHeader(event, 'cookie') || ''
    
    if (!cookieHeader) {
      event.context.session = null
      return
    }
    
    // Parse cookies to check for session token (handles both secure and non-secure cookie names)
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    }, {} as Record<string, string>)
    
    // Check for both standard and secure-prefixed cookie names
    const sessionToken = cookies['better-auth.session_token'] || cookies['__Secure-better-auth.session_token']
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
