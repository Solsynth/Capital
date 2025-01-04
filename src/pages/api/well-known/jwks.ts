import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const solarNetworkApi = 'https://api.sn.solsynth.dev'

  const resp = await axios.get(solarNetworkApi + '/cgi/id/well-known/jwks')

  res.status(200).json(resp.data)
}
