import { defineStore } from "pinia"
import { ref } from "vue"
import { solarFetch } from "~/utils/request"

export interface Userinfo {
  isLoggedIn: boolean
  displayName: string
  data: any
}

export const defaultUserinfo: Userinfo = {
  isLoggedIn: false,
  displayName: "Citizen",
  data: null,
}

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
  const userinfo = ref(defaultUserinfo)
  const isReady = ref(false)

  const lastRefreshedAt = ref<Date | null>(null)

  function setTokenSet(atk: string, rtk: string) {
    lastRefreshedAt.value = new Date()
    useAtk().value = atk
    useRtk().value = rtk
  }

  async function getAtk() {
    if (lastRefreshedAt.value != null && Math.floor(Math.abs(Date.now() - lastRefreshedAt.value.getTime()) / 60000) < 3) {
      return useAtk().value
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
      return out["access_token"]
    }
  }

  async function readProfiles() {
    if (!useLoggedInState().value) {
      isReady.value = true
    }

    const config = useRuntimeConfig()

    const res = await solarFetch("/cgi/auth/users/me")

    if (res.status !== 200) {
      return
    }

    const data = await res.json()

    isReady.value = true
    userinfo.value = {
      isLoggedIn: true,
      displayName: data["nick"],
      data: data,
    }
  }

  return { userinfo, lastRefreshedAt, isReady, setTokenSet, getAtk, readProfiles }
})
