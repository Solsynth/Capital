const cache = new Map<string, { data: unknown; expires: number }>()

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.data as T)

  return fn().then((data) => {
    cache.set(key, { data, expires: Date.now() + ttlMs })
    return data
  })
}
