import { defineEventHandler } from 'h3'
import { solarFetch } from '~/utils/request'

export default defineEventHandler(async () => {
  const solarNetworkApi = 'https://api.sn.solsynth.dev'

  const resp = await solarFetch(`${solarNetworkApi}/cgi/id/well-known/jwks`)

  return await resp.json()
})