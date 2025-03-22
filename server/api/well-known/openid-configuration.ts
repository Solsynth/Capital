import { defineEventHandler } from 'h3'
import { solarFetch } from '~/utils/request'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const siteUrl = config.app.baseURL

  const resp = await solarFetch(`${config.public.solarNetworkApi}/cgi/id/well-known/openid-configuration`)
  const out: Record<string, any> = await resp.json()

  out['authorization_endpoint'] = `${siteUrl}/auth/authorize`
  out['jwks_uri'] = `${siteUrl}/.well-known/jwks`

  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'string' && v.startsWith('https://id.solsynth.dev/api')) {
      out[k] = v.replace('https://id.solsynth.dev/api', `${config.public.solarNetworkApi}/cgi/id`)
    }
  }

  return out
})