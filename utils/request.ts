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
      Authorization: `Bearer ${await auth.getAtk()}`,
    },
  })
}

export function getAttachmentUrl(identifier: string | undefined): string | undefined {
  if (identifier == null || identifier.length == 0) {
    return undefined
  }
  if (identifier.startsWith("http")) {
    return identifier
  }
  return `${useRuntimeConfig().public.solarNetworkApi}/cgi/uc/attachments/${identifier}`
}
