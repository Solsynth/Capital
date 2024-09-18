<template>
  <div class="h-[calc(100vh-80px)] flex flex-col justify-center items-center">
    <h1 class="text-2xl font-bold">{{ t("attachmentCreate") }}</h1>
    <p>{{ t("attachmentCreateCaption") }}</p>

    <div class="my-5 w-[640px]">
      <v-expand-transition>
        <div v-if="!multipartProgress.value">
          <v-file-input label="File input" variant="solo" :hide-details="true" v-model="content"></v-file-input>

          <v-select
            label="Storage pool"
            variant="underlined"
            :items="poolOptions"
            item-title="label"
            item-value="value"
            density="comfortable"
            prepend-icon="mdi-database"
            :hide-details="true"
            class="mt-5"
            v-model="pool"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item.raw.description" :disabled="item.raw.disabled" />
            </template>
          </v-select>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="multipartProgress.value" class="text-center flex flex-col">
          <span class="text-sm">
            {{ success ? t("attachmentUploadCompleted") : t("attachmentUploadProgress") }}
            {{ multipartProgress.current }}/{{ multipartProgress.total }}
            {{ (multipartProgress.value * 100).toFixed(2) }}%
          </span>
          <p class="text-xs text-grey">{{ formatBytes(multipartSize) }} per chunk · #{{ multipartInfo?.rid }}</p>
          <v-progress-linear class="mt-2" :model-value="multipartProgress.value" :max="1" height="4" rounded />
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="success">
          <v-card class="mt-3">
            <attachment-carousel :attachments="[multipartInfo.rid]" />
          </v-card>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <v-alert v-if="error" variant="tonal" type="error" class="text-xs mt-3">
          {{ t("errorOccurred", [error]) }}
        </v-alert>
      </v-expand-transition>
    </div>

    <div class="flex">
      <v-btn :text="t('upload')" prepend-icon="mdi-upload" variant="plain" :loading="loading" @click="submit" />
      <v-btn
        :text="t('cancel')"
        color="grey"
        append-icon="mdi-exit-to-app"
        variant="plain"
        to="/gallery"
        :disabled="loading"
      />
    </div>

    <copyright class="mt-4" service="paperclip" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
})

useHead({
  title: "Create Attachment",
})

const { t } = useI18n()

const poolOptions = [
  { label: "Interactive", description: "Public indexable, no lifecycle.", value: "interactive" },
  { label: "Messaging", description: "Has lifecycle, will delete after 14 days.", value: "messaging" },
  { label: "Dedicated Pool", description: "Your own configuration, coming soon.", value: "dedicated", disabled: true },
]

const content = ref<File | null>(null)
const pool = ref("interactive")

const error = ref<string | null>(null)
const success = ref(false)

const multipartSize = ref(0)
const multipartInfo = ref<any>(null)
const multipartProgress = reactive<{ value: number | null; current: number; total: number }>({
  value: null,
  current: 0,
  total: 0,
})

const loading = ref(false)

async function submit() {
  if (!content.value) return

  loading.value = true

  const limit = 3

  try {
    await createMultipartPlaceholder()
    console.log(`[PAPERCLIP] Multipart placeholder has been created with rid ${multipartInfo.value.rid}`)

    multipartProgress.value = 0
    multipartProgress.current = 0

    const chunks = Object.keys(multipartInfo.value["file_chunks"] ?? {})
    multipartProgress.total = chunks.length

    const uploadChunks = async (chunk: string) => {
      try {
        await uploadSingleMultipart(chunk)
        multipartProgress.current++
        console.log(`[PAPERCLIP] Uploaded multipart ${multipartProgress.current}/${multipartProgress.total}`)
        multipartProgress.value = multipartProgress.current / multipartProgress.total
      } catch (err) {
        console.log(`[PAPERCLIP] Upload multipart ${chunk} failed, retrying in 3 seconds...`)
        await new Promise((r) => setTimeout(r, 3000))
        await uploadChunks(chunk)
      }
    }

    for (let i = 0; i < chunks.length; i += limit) {
      const chunkSlice = chunks.slice(i, i + limit)
      await Promise.all(chunkSlice.map(uploadChunks))
    }

    if (multipartInfo.value["is_uploaded"]) {
      console.log(`[PAPERCLIP] Entire file has been uploaded in ${multipartProgress.total} chunk(s)`)
      success.value = true
    }
  } catch (e) {
    console.error(e)
    error.value = e as string
  }

  loading.value = false
}

async function createMultipartPlaceholder() {
  if (!content.value) return

  const mimetypeMap: { [id: string]: string } = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    mp3: "audio/mp3",
    wav: "audio/wav",
    m4a: "audio/m4a",
  }
  const mimetype = mimetypeMap[content.value.name.split(".").pop() as string]

  const nameArray = content.value.name.split(".")
  nameArray.pop()

  const resp = await solarFetch("/cgi/uc/attachments/multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pool: pool.value,
      size: content.value.size,
      name: content.value.name,
      alt: nameArray.join("."),
      mimetype: mimetype,
    }),
  })
  if (resp.status != 200) throw new Error(await resp.text())
  const data = await resp.json()

  multipartSize.value = data["chunk_size"]
  multipartInfo.value = data["meta"]
}

async function uploadSingleMultipart(chunkId: string) {
  if (!content.value) return
  if (!multipartInfo.value) return

  const chunkIdx: number = multipartInfo.value["file_chunks"][chunkId]
  const chunk = content.value.slice(chunkIdx * multipartSize.value, (chunkIdx + 1) * multipartSize.value)

  const data = new FormData()
  data.set("file", chunk)

  const resp = await solarFetch(`/cgi/uc/attachments/multipart/${multipartInfo.value.rid}/${chunkId}`, {
    method: "POST",
    body: data,
    signal: AbortSignal.timeout(3 * 60 * 1000),
  })
  if (resp.status != 200) throw new Error(await resp.text())
  multipartInfo.value = await resp.json()
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
</script>
