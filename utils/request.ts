export async function solarFetch(input: string | URL | globalThis.Request, init?: RequestInit) {
  const auth = useUserinfo()
  const config = useRuntimeConfig()

  return await fetch(`${config.public.solarNetworkApi}${input}`, {
    ...init,
    headers: {
      ...init?.headers,
      "Authorization": `Bearer ${await auth.getAtk()}`,
    },
  })
}
