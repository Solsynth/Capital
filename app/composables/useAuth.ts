import { createAuthClient } from 'better-auth/vue'

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return createAuthClient({
    baseURL: url.origin,
    fetchOptions: { headers },
  })
}

export async function useServerSession() {
  if (!import.meta.server) {
    throw new Error('useServerSession can only be used on the server')
  }
  
  const event = useRequestEvent()
  return event.context.session || null
}
