import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const resp = await fetch(`${config.public.solarNetworkApi}/cgi/id/well-known/jwks`)

  return await resp.json()
})