<template>
  <v-container class="h-[calc(100vh-80px)] flex flex-col gap-3 items-center justify-center">
    <v-card class="w-full max-w-[720px] overflow-auto" :loading="loading">
      <v-card-text class="card-grid pa-9">
        <div>
          <v-avatar color="accent" icon="mdi-delete" size="large" class="card-rounded mb-2" />
          <h1 class="text-2xl">Delete account</h1>
          <p>Delete all the data and your account on Solar Network.</p>
        </div>

        <v-window :touch="false" :model-value="panel" class="pa-2 mx-[-0.5rem]">
          <v-window-item value="confirm">
            <div class="flex items-center">
              <v-form class="flex-grow-1" @submit.prevent="confirm">
                <v-alert variant="tonal" type="warning" class="text-xs mb-3">
                  <p><b>Are you sure to delete your account?</b></p>
                  This action cannot be undone. And all the delete related to your account will be deleted also.
                </v-alert>

                <v-expand-transition>
                  <v-alert v-show="error" variant="tonal" type="error" class="text-xs mb-3">
                    Something went wrong... {{ error }}
                  </v-alert>
                </v-expand-transition>

                <div class="flex justify-end">
                  <v-btn
                    type="submit"
                    variant="text"
                    color="primary"
                    class="justify-self-end"
                    append-icon="mdi-arrow-right"
                    :disabled="loading"
                  >
                    Next
                  </v-btn>
                </div>
              </v-form>
            </div>
          </v-window-item>
          <v-window-item value="callback">
            <div>
              <v-icon icon="mdi-fire" size="32" color="grey-darken-3" class="mb-3" />

              <h1 class="font-bold text-xl">Deleted</h1>
              <p>Your account has been deleted successfully.</p>

              <p class="mt-3">You're no longer be able to sign in into your account.</p>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <copyright service="passport" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"

const config = useRuntimeConfig()

const route = useRoute()
const router = useRouter()

const error = ref<string | null>(null)

const loading = ref(false)

const panel = ref("confirm")

async function confirm() {
  if (!route.query["code"]) {
    error.value = "code was not exists"
    return
  }

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/id/users/me/deletion`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: route.query["code"],
    }),
  })
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    loading.value = true
    panel.value = "callback"
    await router.push("/auth/sign-in")
  }
  loading.value = false
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
