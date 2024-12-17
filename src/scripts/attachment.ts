export function getAttachmentUrl(identifier: string): string {
  if (identifier.startsWith('http')) {
    return identifier
  }
  const baseUrl = import.meta.env.PUBLIC_SOLAR_NETWORK_URL
  return `${baseUrl}/cgi/uc/attachments/${identifier}`
}

export async function fetchAttachmentMeta(
  identifiers: string[]
): Promise<any[]> {
  if (!identifiers) return []

  const baseUrl = import.meta.env.PUBLIC_SOLAR_NETWORK_URL
  const resp = await fetch(
    `${baseUrl}/cgi/uc/attachments?take=${identifiers.length}&id=${identifiers.join(',')}`
  )
  if (resp.status !== 200) {
    throw new Error(`Failed to fetch attachment meta: ${await resp.text()}`)
  }
  const out = await resp.json()
  return out['data']
}
