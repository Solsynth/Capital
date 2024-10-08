<template>
  <v-container class="px-12">
    <div class="flex justify-between items-center mt-5">
      <div class="flex items-end gap-2">
        <h1 class="text-2xl">Edit sticker: {{ data?.name ?? "Loading" }}</h1>
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
        <v-col cols="12">
          <v-card title="Pack info" prepend-icon="mdi-sticker-emoji" density="compact">
            <v-card-text class="mt-2">
              <p class="text-lg"><b>{{ pack?.name ?? "Loading..." }}</b></p>
              <p>{{ pack?.description ?? "Please stand by..." }}</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Name"
            name="name"
            variant="outlined"
            persistent-hint
            hint="A human friendly name for user to recognize this sticker"
            v-model="stickerName"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Alias"
            name="alias"
            variant="outlined"
            persistent-hint
            hint="A placeholder of this sticker, will prepend pack's prefix"
            v-model="stickerAlias"
          >
            <template #prepend-inner>
              <p class="ms-1 me-[-5px] text-grey">{{ pack?.prefix }}</p>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Attachment"
            name="attachment_id"
            variant="outlined"
            persistent-hint
            v-model="attachmentRid"
          >
            <template #details>
              <p class="order-first v-messages">
                The texture / image of this sticker, you can upload one from
                <nuxt-link to="/gallery/new?pool=c3RpY2tlcg" target="_blank" class="underline">here</nuxt-link>
              </p>
            </template>

            <template #prepend-inner>
              <v-img
                cover
                aspect-ratio="1"
                width="28"
                height="28"
                color="grey-lighten-2"
                rounded="sm"
                :src="attachmentRid.length > 0 ? `${config.public.solarNetworkApi}/cgi/uc/attachments/${attachmentRid}` : `example.com/not-found`"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height" v-if="attachmentRid.length > 0">
                    <v-progress-circular
                      size="x-small"
                      width="3"
                      color="grey-lighten-4"
                      indeterminate
                    ></v-progress-circular>
                  </div>
                  <div class="d-flex align-center justify-center fill-height" v-else>
                    <v-icon icon="mdi-image-broken-variant" class="block" size="18" />
                  </div>
                </template>
              </v-img>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <div class="flex justify-end">
        <v-btn type="submit" text="Save changes" append-icon="mdi-content-save" :disabled="data == null"
               :loading="submitting" />
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
  title: "Edit Sticker",
})


const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const data = ref<any>(null)
const pack = ref<any>(null)

const attachmentRid = ref<string>("")
const stickerName = ref<string>("")
const stickerAlias = ref<string>("")

async function readPack() {
  const res = await solarFetch(`/cgi/uc/stickers/packs/${route.params.id}`)
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    pack.value = await res.json()
  }
}

async function readSticker() {
  const res = await solarFetch(`/cgi/uc/stickers/${route.params.sticker}`)
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    data.value = await res.json()
    stickerName.value = data.value?.name
    stickerAlias.value = data.value?.alias
    attachmentRid.value = data.value?.attachment.rid
  }
}

onMounted(() => Promise.all([readPack(), readSticker()]))

const error = ref<null | string>(null)
const submitting = ref(false)

async function submit(evt: SubmitEvent) {
  const data = Object.fromEntries(new FormData(evt.target as HTMLFormElement).entries())
  if (!data.name) return

  submitting.value = true

  const res = await solarFetch(`/cgi/uc/stickers/${route.params.sticker}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pack_id: parseInt(route.params.id.toString()),
      ...data,
    }),
  })
  if (res.status != 200) {
    error.value = await res.text()
  } else {
    navigateTo("/creator/stickers")
  }

  submitting.value = false
}
</script>
