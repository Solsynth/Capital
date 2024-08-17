<template>
  <div>
    <v-icon icon="mdi-lan-check" size="32" color="grey-darken-3" class="mb-3" />

    <h1 class="font-bold text-xl">{{ t("signInCompleted") }}</h1>
    <p>{{ t("signInCompletedCaption") }}</p>

    <v-expand-transition>
      <v-alert v-show="error" variant="tonal" type="error" class="text-xs mb-3">
        {{ t("errorOccurred", [error]) }}
      </v-alert>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const route = useRoute()
const router = useRouter()
const auth = useUserinfo()

const props = defineProps<{ loading?: boolean; currentFactor?: any; ticket?: any }>()
const emits = defineEmits(["update:loading"])

const error = ref<string | null>(null)

async function load() {
  emits("update:loading", true)
  await getToken(props.ticket.grant_token)
  await auth.readProfiles()
  setTimeout(() => callback(), 1850)
}

onMounted(() => load())

async function getToken(tk: string) {
  const res = await fetch(`${config.public.solarNetworkApi}/cgi/id/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: tk,
      grant_type: "grant_token",
    }),
  })
  if (res.status !== 200) {
    const err = await res.text()
    error.value = err
    throw new Error(err)
  } else {
    const out = await res.json()
    auth.setTokenSet(out["access_token"], out["refresh_token"])
    error.value = null
  }
}

function callback() {
  if (route.query["close"]) {
    window.close()
  } else if (route.query["redirect_uri"]) {
    window.open((route.query["redirect_uri"] as string) ?? "/", "_self")
  } else {
    router.push("/users/me")
  }
}
</script>
