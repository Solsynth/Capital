import { defineEventHandler } from 'h3'
import { solarFetch } from '~/utils/request'

export default defineEventHandler(async () => {
  const siteUrl = 'https://solsynth.dev'
  const solarNetworkApi = 'https://api.sn.solsynth.dev'

  const resp = await solarFetch(`${solarNetworkApi}/cgi/id/well-known/openid-configuration`)
  const out: Record<string, any> = await resp.json()

  out['authorization_endpoint'] = `${siteUrl}/auth/authorize`
  out['jwks_uri'] = `${siteUrl}/.well-known/jwks`

  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'string' && v.startsWith('https://id.solsynth.dev/api')) {
      out[k] = v.replace('https://id.solsynth.dev/api', `${solarNetworkApi}/cgi/id`)
    }
  }

  return out
})