import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const siteUrl = 'https://solsynth.dev'
  const solarNetworkApi = 'https://api.sn.solsynth.dev'

  const resp = await axios.get(solarNetworkApi + '/cgi/id/well-known/openid-configuration')
  const out: Record<string, any> = resp.data

  out['authorization_endpoint'] = siteUrl + '/auth/authorize'
  out['jwks_uri'] = siteUrl + '/.well-known/jwks'

  for (let [k, v] of Object.entries(out)) {
    if (typeof v === 'string') {
      if (v.startsWith('https://id.solsynth.dev/api')) {
        out[k] = v.replace('https://id.solsynth.dev/api', solarNetworkApi + '/cgi/id')
      }
    }
  }

  res.status(200).json(out)
}
