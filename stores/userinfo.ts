import { defineStore } from "pinia"
import { ref } from "vue"

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

export function setTokenSet(atk: string, rtk: string) {
  useAtk().value = atk
  useRtk().value = rtk
}

export function useLoggedInState() {
  return computed(() => useAtk().value != null)
}

export const useUserinfo = defineStore("userinfo", () => {
  const userinfo = ref(defaultUserinfo)
  const isReady = ref(false)

  async function readProfiles() {
    if (!useLoggedInState().value) {
      isReady.value = true
    }

    const config = useRuntimeConfig()

    const res = await fetch(`${config.public.solarNetworkApi}/cgi/auth/users/me`, {
      headers: { Authorization: `Bearer ${useAtk().value}` },
    })

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

  return { userinfo, isReady, readProfiles }
})
