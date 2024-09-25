<template>
  <v-container class="px-12">
    <div class="flex justify-between items-center mt-5">
      <div class="flex items-end gap-2">
        <h1 class="text-2xl">Create a new bot</h1>
      </div>

      <div class="flex gap-2">
        <v-btn
          color="grey"
          text="Cancel"
          prepend-icon="mdi-arrow-left"
          variant="tonal"
          to="/dev/bots"
        />
      </div>
    </div>

    <v-expand-transition>
      <v-alert v-if="error" variant="tonal" type="error" class="text-xs mt-5 mb-3">
        {{ t("errorOccurred", [error]) }}
      </v-alert>
    </v-expand-transition>

    <v-form class="mt-5" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6" lg="4">
          <v-text-field
            label="Name"
            name="name"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="6" lg="4">
          <v-text-field
            label="Nick"
            name="nick"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="6" lg="4">
          <v-textarea
            auto-grow
            rows="1"
            label="Description"
            name="description"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <div class="flex justify-end">
        <v-btn type="submit" text="Create" append-icon="mdi-plus" :loading="submitting" />
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dev-portal",
  middleware: ["auth"],
})

useHead({
  title: "New Bot",
})

const { t } = useI18n()

const error = ref<null | string>(null)
const submitting = ref(false)

async function submit(evt: SubmitEvent) {
  const data = Object.fromEntries(new FormData(evt.target as HTMLFormElement).entries())
  if (!data.name) return

  submitting.value = true

  const res = await solarFetch("/cgi/id/dev/bots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    navigateTo('/dev/bots')
  }

  submitting.value = false
}
</script>
