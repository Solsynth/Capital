<template>
  <div class="h-[calc(100vh-80px)] flex flex-col justify-center items-center">
    <h1 class="text-2xl font-bold">Create Attachment</h1>
    <p>Use Solar Network host your files</p>

    <div class="my-5 w-[640px]">
      <v-expand-transition>
        <v-file-input
          label="File input"
          variant="solo"
          :hide-details="true"
          v-if="!multipartProgress.value"
          v-model="content"
        ></v-file-input>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="multipartProgress.value" class="text-center flex flex-col">
          <span class="text-sm">
            {{ success ? "Uploaded" : "Uploading" }}
            {{ multipartProgress.current }}/{{ multipartProgress.total }}
            {{ (multipartProgress.value * 100).toFixed(2) }}%
          </span>
          <p class="text-xs text-grey">{{ formatBytes(multipartSize) }} per chunk · #{{ multipartInfo?.rid }}</p>
          <v-progress-linear class="mt-2" :model-value="multipartProgress.value" :max="1" height="4" rounded />
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="success">
          <div class="mt-3">
            <attachment-carousel :attachments="[multipartInfo.rid]" />
          </div>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <v-alert v-if="error" variant="tonal" type="error" class="text-xs mt-3">
          {{ t("errorOccurred", [error]) }}
        </v-alert>
      </v-expand-transition>
    </div>

    <div class="flex">
      <v-btn text="Upload" prepend-icon="mdi-upload" variant="plain" :loading="loading" @click="submit" />
      <v-btn text="Cancel" color="grey" append-icon="mdi-exit-to-app" variant="plain" to="/gallery"
             :disabled="loading" />
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

const content = ref<File | null>(null)

const error = ref<string | null>(null)
const success = ref(false)

const multipartSize = ref(0)
const multipartInfo = ref<any>(null)
const multipartProgress = reactive<{ value: number | null, current: number, total: number }>({
  value: null,
  current: 0,
  total: 0,
})

const loading = ref(false)

async function submit() {
  if (!content.value) return

  loading.value = true

  try {
    await createMultipartPlaceholder()
    console.log(`[PAPERCLIP] Multipart placeholder has been created with rid ${multipartInfo.value.rid}`)
    let taskIdx = 0
    multipartProgress.value = 0
    multipartProgress.current = taskIdx
    if (multipartInfo.value["file_chunks"]) {
      multipartProgress.total = Object.keys(multipartInfo.value["file_chunks"] ?? {}).length
    }
    for (const chunk in multipartInfo.value["file_chunks"]) {
      await uploadSingleMultipart(chunk)
      taskIdx++
      console.log(`[PAPERCLIP] Uploaded multipart ${taskIdx}/${multipartProgress.total}`)
      multipartProgress.value = taskIdx / multipartProgress.total
      multipartProgress.current = taskIdx
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

  const nameArray = content.value.name.split(".")
  nameArray.pop()

  const resp = await solarFetch("/cgi/uc/attachments/multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pool: "interactive",
      size: content.value.size,
      name: content.value.name,
      alt: nameArray.join("."),
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
