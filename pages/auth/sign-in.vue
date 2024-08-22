<template>
  <v-container class="h-[calc(100vh-80px)] flex flex-col gap-3 items-center justify-center">
    <auth-callback-hint />

    <v-card class="w-full max-w-[720px] overflow-auto" :loading="loading">
      <v-card-text class="card-grid pa-9">
        <div>
          <v-avatar color="accent" icon="mdi-login-variant" size="large" class="card-rounded mb-2" />
          <h1 class="text-2xl">{{ t("signInTitle") }}</h1>
          <p v-if="ticket" class="max-w-5/6">{{ t("multiFactorCaption") }}</p>
          <p v-else class="max-w-5/6">{{ t("signInCaption") }}</p>
        </div>

        <v-window :touch="false" :model-value="panel" class="pa-2 mx-[-0.5rem]">
          <v-window-item v-for="(k, idx) in Object.keys(panels)" :key="idx" :value="k">
            <component :is="panels[k]" @swap="(val: string) => (panel = val)" v-model:loading="loading"
                       v-model:currentFactor="currentFactor" v-model:ticket="ticket" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <copyright service="passport" />
  </v-container>
</template>

<script setup lang="ts">
import { type Component, onMounted, ref } from "vue"
import FactorPicker from "~/components/auth/FactorPicker.vue"
import FactorApplicator from "~/components/auth/FactorApplicator.vue"
import AccountAuthenticate from "~/components/auth/Authenticate.vue"
import AuthenticateCompleted from "~/components/auth/AuthenticateCompleted.vue"

const { t } = useI18n()

definePageMeta({
  alias: ["/auth/mfa"],
})

useHead({
  title: t('signInTitle'),
})

const route = useRoute()

const loading = ref(false)

const currentFactor = ref<any>(null)
const ticket = ref<any>(null)

async function pickUpTicket() {
  if (route.query["ticketId"]) {
    loading.value = true
    const res = await fetch(`/api/auth/tickets/${route.query["ticketId"]}`)
    if (res.status == 200) {
      ticket.value = await res.json()
      if (ticket.value["available_at"] != null) panel.value = "completed"
      else panel.value = "mfa"
    }
    loading.value = false
  }
}

onMounted(() => pickUpTicket())

const id = useUserinfo()
const router = useRouter()

watch(id, (value) => {
  if (value.isLoggedIn) {
    if (route.query["close"]) {
      window.close()
    } else if (route.query["redirect_uri"]) {
      window.open((route.query["redirect_uri"] as string) ?? "/", "_self")
    } else {
      router.push("/users/me")
    }
  }
}, { deep: true, immediate: true })

const panel = ref("authenticate")

const panels: { [id: string]: Component } = {
  authenticate: AccountAuthenticate,
  mfa: FactorPicker,
  applicator: FactorApplicator,
  completed: AuthenticateCompleted,
}
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.card-rounded {
  border-radius: 8px;
}
</style>
