import axios from 'axios'
import applyCaseMiddleware from 'axios-case-converter'

export let sni = applyCaseMiddleware(
  axios.create({
    baseURL: 'https://api.sn.solsynth.dev',
  }),
  {
    ignoreParams: true,
    ignoreHeaders: true,
  },
)
