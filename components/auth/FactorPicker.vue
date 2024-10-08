<template>
  <div class="flex items-center">
    <div class="flex-grow-1">
      <v-card class="mb-3">
        <v-list density="compact" color="primary">
          <v-list-item
            v-for="(item, idx) in factors ?? []"
            :key="idx"
            :prepend-icon="getFactorType(item)?.icon"
            :title="getFactorType(item)?.label"
            :active="focus === item.id"
            :disabled="getFactorAvailable(item)"
            @click="focus = item.id"
          />
        </v-list>
      </v-card>

      <v-expand-transition>
        <v-alert v-show="error" variant="tonal" type="error" class="text-xs mb-3">
          {{ t("errorOccurred", [error]) }}
        </v-alert>
      </v-expand-transition>

      <div class="flex justify-end">
        <v-btn variant="text" color="primary" class="justify-self-end" append-icon="mdi-arrow-right" @click="submit">
          {{ t("next") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const focus = ref<number | null>(null)
const factors = ref<any[]>([])

const error = ref<string | null>(null)

const props = defineProps<{ ticket?: any }>()
const emits = defineEmits(["swap", "update:loading", "update:currentFactor"])

async function load() {
  emits("update:loading", true)
  const res = await fetch(`${config.public.solarNetworkApi}/cgi/id/auth/factors?ticketId=${props.ticket.id}`)
  if (res.status !== 200) {
    error.value = await res.text()
  } else {
    factors.value = await res.json()
  }
  emits("update:loading", false)
}

onMounted(() => load())

async function submit() {
  if (!focus.value) return

  emits("update:loading", true)
  const res = await fetch(`${config.public.solarNetworkApi}/cgi/id/auth/factors/${focus.value}`, {
    method: "POST",
  })
  if (res.status !== 200 && res.status !== 204) {
    error.value = await res.text()
  } else {
    const item = factors.value.find((item: any) => item.id === focus.value)
    emits("update:currentFactor", item)
    emits("swap", "applicator")
    error.value = null
    focus.value = null
  }
  emits("update:loading", false)
}

function getFactorType(item: any) {
  switch (item.type) {
    case 0:
      return { icon: "mdi-form-textbox-password", label: t("multiFactorTypePassword") }
    case 1:
      return { icon: "mdi-email-fast", label: t("multiFactorTypeEmail") }
  }
}

function getFactorAvailable(factor: any) {
  const blacklist: number[] = props.ticket?.factor_trail ?? []
  return blacklist.includes(factor.id)
}
</script>
