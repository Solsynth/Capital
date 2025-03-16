import { defineStore } from "pinia"
import { ref } from "vue"
import { solarFetch } from "~/utils/request"

export function useAtk() {
  return useCookie("solar_network_atk", { path: "/", maxAge: 31556952000 })
}

export function useRtk() {
  return useCookie("solar_network_rtk", { path: "/", maxAge: 31556952000 })
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

  function setTokenSet(atk: string, rtk: string) {
    useAtk().value = atk
    useRtk().value = rtk
  }

  async function getAtk() {
    const atk = useAtk()
    if (!useLoggedInState().value) return atk.value

    const parts = atk.value?.split(".") ?? []
    if (parts.length != 3) return atk.value

    const payload = JSON.parse(atob(parts[1]))
    const exp: number = payload["exp"]

    if (exp > Date.now() / 1000) {
      return atk.value
    }

    if (refreshCompleter != null) {
      return await refreshCompleter.promise
    } else {
      refreshCompleter = new Completer<string>()
    }

    const config = useRuntimeConfig()

    const res = await fetch(`${config.public.solarNetworkApi}/cgi/id/auth/token`, {
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
      console.log("[Passport] Access token has been refreshed now.")
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
      fetchCompleter = null
      isReady.value = true
      return
    }

    const res = await solarFetch("/cgi/id/users/me")

    if (res.status !== 200) {
      fetchCompleter.complete(true)
      fetchCompleter = null
      isReady.value = true
      return
    }

    const data = await res.json()

    isLoggedIn.value = true
    isReady.value = true
    userinfo.value = data
    fetchCompleter.complete(true)
    fetchCompleter = null
  }

  return { userinfo, isLoggedIn, isReady, fetchCompleter, setTokenSet, getAtk, readProfiles }
})

export class Completer<T> {
  public readonly promise: Promise<T>
  public complete: (value: PromiseLike<T> | T) => void
  private reject: (reason?: any) => void

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.complete = resolve
      this.reject = reject
    })
  }
}
