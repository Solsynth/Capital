import axios, { type AxiosInstance } from 'axios'
import applyCaseMiddleware from 'axios-case-converter'
import Cookies from 'universal-cookie'
import { setTokenCookies } from './auth'

const baseURL = 'https://api.sn.solsynth.dev'

export const sni: AxiosInstance = (() => {
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
  const cookies = new Cookies()
  if (!cookies.get('nex_user_atk') || !cookies.get('nex_user_rtk')) return

  const ogTk: string = cookies.get('nex_user_atk')!
  if (!isTokenExpired(ogTk)) return ogTk

  const resp = await axios.post(
    '/cgi/id/auth/token',
    {
      refresh_token: cookies.get('nex_user_rtk')!,
      grant_type: 'refresh_token',
    },
    { baseURL },
  )
  const atk: string = resp.data['access_token']
  const rtk: string = resp.data['refresh_token']
  setTokenCookies(atk, rtk)

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

export function getAttachmentUrl(identifer: string): string {
  if (identifer.startsWith('http')) return identifer
  return `${baseURL}/cgi/uc/attachments/${identifer}`
}
