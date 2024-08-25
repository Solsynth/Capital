<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props }">
      <slot name="activator" v-bind="{ props }" />
    </template>

    <v-card title="Bot Key" :subtitle="`#${props.item.id.toString().padStart(8, '0')}`">
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <div class="flex justify-between items-center">
              <span>Granted</span>
              <v-icon :icon="getIcon(props.item.ticket.last_grant_at != null)" size="16" />
            </div>
          </v-col>
          <v-col cols="6">
            <div class="flex justify-between items-center">
              <span>Lifecycle</span>
              <span class="font-mono">{{ props.item.lifecycle ?? "-" }}</span>
            </div>
          </v-col>
        </v-row>

        <v-expand-transition>
          <v-alert v-if="error" variant="tonal" type="error" class="text-xs mt-5">
            {{ t("errorOccurred", [error]) }}
          </v-alert>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="token" class="flex flex-col gap-2 mt-5">
            <div>
              <p class="mb-0.25">Access Token</p>
              <v-code class="font-mono px-3 mx-[-4px] overflow-y-auto text-no-wrap">
                {{ token.access_token }}
              </v-code>
            </div>
            <div>
              <p class="mb-0.25">Refresh Token</p>
              <v-code class="font-mono px-3 mx-[-4px] overflow-y-auto text-no-wrap">
                {{ token.refresh_token }}
              </v-code>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <div class="flex justify-end px-5.5 py-5">
        <v-btn variant="tonal" text="Roll / Grant" append-icon="mdi-refresh" :loading="submitting" @click="getToken" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{ item: any }>()

const error = ref<null | string>(null)

const token = ref<null | { access_token: string, refresh_token: string }>(null)

const submitting = ref(false)

function getIcon(value: boolean): string {
  if (value) return "mdi-check"
  else return "mdi-close"
}

async function getToken() {
  submitting.value = true

  let code = props.item.ticket.grant_token
  if (props.item.ticket.last_grant_at != null) {
    const res = await solarFetch(`/cgi/id/dev/bots/${props.item.account_id}/keys/${props.item.id}/roll`, {
      method: "POST",
    })
    if (res.status != 200) {
      error.value = await res.text()
      submitting.value = false
      return
    } else {
      code = (await res.json()).ticket.grant_token
    }
  }

  const res = await solarFetch("/cgi/id/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "grant_token",
      code: code,
    }),
  })
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    token.value = await res.json()
  }

  submitting.value = false
}
</script>
