import { defineStore } from "pinia"
import { ref } from "vue"
import { solarFetch } from "~/utils/request"

export function useAtk() {
  return useCookie("__hydrogen_atk", { watch: "shallow" })
}

export function useRtk() {
  return useCookie("__hydrogen_rtk", { watch: "shallow" })
}

export function useLoggedInState() {
  return computed(() => useAtk().value != null)
}

export const useUserinfo = defineStore("userinfo", () => {
  const userinfo = ref<any>(null)
  const isReady = ref(false)
  const isLoggedIn = ref(false)

  let fetchCompleter: Completer<boolean> | null = null
  let refreshCompleter: Completer<string> | null = null

  const lastRefreshedAt = ref<Date | null>(null)

  function setTokenSet(atk: string, rtk: string) {
    lastRefreshedAt.value = new Date()
    useAtk().value = atk
    useRtk().value = rtk
  }

  async function getAtk() {
    if (!useLoggedInState().value) return useAtk().value
    if (lastRefreshedAt.value != null && Math.floor(Math.abs(Date.now() - lastRefreshedAt.value.getTime()) / 60000) < 3) {
      return useAtk().value
    }

    if (refreshCompleter != null) {
      return await refreshCompleter.promise
    } else {
      refreshCompleter = new Completer<string>()
    }

    const config = useRuntimeConfig()

    const res = await fetch(`${config.public.solarNetworkApi}/cgi/auth/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: useRtk().value,
        grant_type: "refresh_token",
      }),
    })
    if (res.status !== 200) {
      const err = await res.text()
      throw new Error(err)
    } else {
      const out = await res.json()
      console.log("[PASSPORT] Access token has been refreshed now.")
      setTokenSet(out["access_token"], out["refresh_token"])
      refreshCompleter.complete(out["access_token"])
      return out["access_token"]
    }
  }

  async function readProfiles() {
    if (fetchCompleter != null) {
      await fetchCompleter.promise
      return
    } else {
      fetchCompleter = new Completer<boolean>()
    }

    if (!useLoggedInState().value) {
      fetchCompleter.complete(true)
      isReady.value = true
    }

    const res = await solarFetch("/cgi/auth/users/me")

    if (res.status !== 200) {
      fetchCompleter.complete(true)
      isReady.value = true
      return
    }

    const data = await res.json()

    isLoggedIn.value = true
    isReady.value = true
    userinfo.value = data
    fetchCompleter.complete(true)
  }

  return { userinfo, lastRefreshedAt, isLoggedIn, isReady, fetchCompleter, setTokenSet, getAtk, readProfiles }
})

export class Completer<T> {
  public readonly promise: Promise<T>
  public complete: (value: (PromiseLike<T> | T)) => void
  private reject: (reason?: any) => void

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.complete = resolve
      this.reject = reject
    })
  }
}
