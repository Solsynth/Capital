export async function solarFetch(input: string, init?: RequestInit) {
  const auth = useUserinfo()
  const config = useRuntimeConfig()

  if (!input.startsWith("http")) {
    input = `${config.public.solarNetworkApi}${input}`
  }

  return await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      "Authorization": `Bearer ${await auth.getAtk()}`,
    },
  })
}
