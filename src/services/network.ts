import axios, { AxiosInstance } from 'axios'
import applyCaseMiddleware from 'axios-case-converter'
import { hasCookie, getCookie, setCookie } from 'cookies-next/client'

const baseURL = 'https://api.solsynth.dev'

export let sni: AxiosInstance = (() => {
  const inst = axios.create({
    baseURL,
  })

  inst.interceptors.request.use(
    async (config) => {
      const tk = await refreshToken()
      if (tk) config.headers['Authorization'] = `Bearer ${tk}`
      return config
    },
    (error) => error,
  )

  applyCaseMiddleware(inst, {
    ignoreParams: true,
    ignoreHeaders: true,
  })
  return inst
})()

async function refreshToken(): Promise<string | undefined> {
  if (!hasCookie('nex_user_atk') || !hasCookie('nex_user_rtk')) return

  const ogTk: string = getCookie('nex_user_atk')!
  if (!isTokenExpired(ogTk)) return

  const resp = await axios.post('/cgi/id/auth/token', {
    refresh_token: getCookie('nex_user_rtk')!,
    grant_type: 'refresh_token',
  })
  const atk: string = resp.data['accessToken']
  const rtk: string = resp.data['refreshToken']
  setCookie('nex_user_atk', atk, { path: '/', maxAge: 2592000 })
  setCookie('nex_user_rtk', rtk, { path: '/', maxAge: 2592000 })

  console.log('[Authenticator] Refreshed token...')

  return atk
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const payload = JSON.parse(atob(parts[1]))

    if (!payload.exp) {
      throw new Error("'exp' claim is missing in the JWT payload")
    }

    const now = Math.floor(Date.now() / 1000)

    return now >= payload.exp
  } catch (error) {
    console.error('[Authenticator] Something went wrong with token: ', error)
    return true
  }
}
