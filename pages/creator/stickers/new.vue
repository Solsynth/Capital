<template>
  <v-container class="px-12">
    <div class="flex justify-between items-center mt-5">
      <div class="flex items-end gap-2">
        <h1 class="text-2xl">Create a new sticker pack</h1>
      </div>

      <div class="flex gap-2">
        <v-btn
          color="grey"
          text="Cancel"
          prepend-icon="mdi-arrow-left"
          variant="tonal"
          to="/creator/stickers"
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
        <v-col cols="12" md="6">
          <v-text-field
            label="Name"
            name="name"
            variant="outlined"
            persistent-hint
            hint="A human friendly name for user to recognize this sticker pack"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Prefix"
            name="prefix"
            variant="outlined"
            persistent-hint
            hint="A prefix for every sticker in this pack, will add before sticker's alias"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            auto-grow
            rows="3"
            label="Description"
            name="description"
            variant="outlined"
            persistent-hint
            hint="A description for user to know about this sticker pack"
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
  layout: "creator-hub",
  middleware: ["auth"],
})

useHead({
  title: "New Sticker Pack",
})

const { t } = useI18n()

const error = ref<null | string>(null)
const submitting = ref(false)

async function submit(evt: SubmitEvent) {
  const data = Object.fromEntries(new FormData(evt.target as HTMLFormElement).entries())
  if (!data.name) return

  submitting.value = true

  const res = await solarFetch("/cgi/uc/stickers/packs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    navigateTo('/creator/stickers')
  }

  submitting.value = false
}
</script>
