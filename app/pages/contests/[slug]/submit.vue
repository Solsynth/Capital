<script setup lang="ts">
import { ArrowLeft, Upload, X } from '@lucide/vue'
import {
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from 'reka-ui'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

definePageMeta({
  middleware: 'auth',
})

const slug = computed(() => route.params.slug as string)

const { data: content } = await useAsyncData(`contest-content-${locale.value}-${slug.value}`, async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', `/contests/${locale.value}/%`)
    .all()
  return allContests.find(c => c.path === `/contests/${locale.value}/${slug.value}`) || null
})

const { data: dbState } = await useAsyncData(`contest-state-${slug.value}`, () => {
  return $fetch(`/api/contests/${slug.value}`, {
    headers: { 'x-locale': locale.value },
  })
})

if (!content.value || (dbState.value?.state && !dbState.value.state.submissionEnabled)) {
  navigateTo(localePath(`/contests/${slug.value}`))
}

const title = ref('')
const description = ref('')
const note = ref('')
const repoUrl = ref('')
const tags = ref<string[]>([])
const screenshots = ref<string[]>([])
const agreedToTerms = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploadDragOver = ref(false)
const draggedScreenshotIndex = ref<number | null>(null)

const { upload, isUploading, progress, error: uploadError } = useFileUpload()

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  await uploadFiles(files)
  target.value = ''
}

async function uploadFiles(files: Iterable<File>) {
  for (const file of Array.from(files)) {
    if (screenshots.value.length >= 10) break

    const result = await upload(file)
    if (result?.url) {
      screenshots.value.push(result.url)
    }
  }
}

function handleUploadDragOver(event: DragEvent) {
  event.preventDefault()
  isUploadDragOver.value = true
}

function handleUploadDragLeave() {
  isUploadDragOver.value = false
}

async function handleUploadDrop(event: DragEvent) {
  event.preventDefault()
  isUploadDragOver.value = false
  const files = event.dataTransfer?.files
  if (!files?.length) return
  await uploadFiles(files)
}

function openFilePicker() {
  fileInput.value?.click()
}

function removeScreenshot(idx: number) {
  screenshots.value.splice(idx, 1)
}

function handleScreenshotDragStart(index: number) {
  draggedScreenshotIndex.value = index
}

function handleScreenshotDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleScreenshotDrop(index: number) {
  const fromIndex = draggedScreenshotIndex.value
  if (fromIndex === null || fromIndex === index) {
    draggedScreenshotIndex.value = null
    return
  }

  const [moved] = screenshots.value.splice(fromIndex, 1)
  screenshots.value.splice(index, 0, moved)
  draggedScreenshotIndex.value = null
}

function handleScreenshotDragEnd() {
  draggedScreenshotIndex.value = null
}



async function handleSubmit() {
  submitError.value = ''
  submitting.value = true

  try {
    await $fetch('/api/contests/submissions/create', {
      method: 'POST',
      body: {
        contest_id: slug.value,
        title: title.value,
        description: description.value,
        note: note.value || undefined,
        repo_url: repoUrl.value || undefined,
        screenshots: screenshots.value,
        tags: tags.value,
      },
    })
    submitSuccess.value = true
  }
  catch (e: any) {
    submitError.value = e.data?.statusMessage || 'Submission failed'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="content && !submitSuccess">
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-2xl">
        <NuxtLink
          :to="localePath(`/contests/${slug}`)"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('contests.backToContest') }}
        </NuxtLink>

        <h1 class="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          {{ content.title }}
        </h1>
        <p class="text-sm text-base-content/65 md:text-base">
          {{ content.description }}
        </p>
        <div
          v-if="content.tags?.length"
          class="mt-3 flex flex-wrap gap-1"
        >
          <span
            v-for="tag in content.tags"
            :key="tag"
            class="badge badge-outline badge-xs"
          >{{ tag }}</span>
        </div>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-2xl">
        <div
          v-if="submitError"
          class="mb-6 rounded-lg border border-error/25 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {{ submitError }}
        </div>

        <form
          class="space-y-5 rounded-lg border border-base-200 bg-base-100 p-5 md:p-6"
          @submit.prevent="handleSubmit"
        >
        <!-- Project Title -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('contests.projectTitle') }} *</legend>
          <input
            v-model="title"
            type="text"
            required
            maxlength="120"
            class="input w-full"
            :placeholder="t('contests.projectTitlePlaceholder')"
          />
        </fieldset>

        <!-- Description -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('contests.description') }} *</legend>
          <textarea
            v-model="description"
            required
            rows="4"
            class="textarea w-full"
            :placeholder="t('contests.descriptionPlaceholder')"
          />
        </fieldset>

        <!-- Submission Note -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('contests.submissionNote') }}</legend>
          <textarea
            v-model="note"
            rows="3"
            class="textarea w-full"
            :placeholder="t('contests.submissionNotePlaceholder')"
          />
          <p class="label">{{ t('contests.submissionNotePlaceholder') }}</p>
        </fieldset>

        <!-- Repository URL -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('contests.repoUrl') }} *</legend>
          <input
            v-model="repoUrl"
            type="url"
            required
            class="input w-full"
            :placeholder="t('contests.repoUrlPlaceholder')"
          />
          <p class="label">{{ t('contests.repoUrlHint') }}</p>
        </fieldset>

        <!-- Screenshots -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('contests.screenshots') }} ({{ screenshots.length }}/10)</legend>

          <div v-if="screenshots.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div
              v-for="(url, idx) in screenshots"
              :key="idx"
              draggable="true"
              class="relative group rounded-lg overflow-hidden cursor-move"
              :class="draggedScreenshotIndex === idx ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100' : ''"
              @dragstart="handleScreenshotDragStart(idx)"
              @dragover="handleScreenshotDragOver"
              @drop="handleScreenshotDrop(idx)"
              @dragend="handleScreenshotDragEnd"
            >
              <img :src="url" class="w-full h-32 object-cover">
              <button
                type="button"
                class="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeScreenshot(idx)"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>

          <label
            v-if="screenshots.length < 10"
            class="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
            :class="isUploadDragOver ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary'"
            @dragover="handleUploadDragOver"
            @dragleave="handleUploadDragLeave"
            @drop="handleUploadDrop"
            @click="openFilePicker"
          >
            <Upload v-if="!isUploading" class="w-8 h-8 opacity-50 mb-2" />
            <span class="text-sm opacity-70 text-center">{{ t('contests.screenshotsUpload') }}</span>
            <span class="text-xs opacity-50 mt-1 text-center">
              Drag and drop to upload, then drag screenshots to reorder.
            </span>
            <div v-if="isUploading" class="w-full max-w-xs mt-4">
              <progress class="progress progress-primary w-full" :value="progress" max="100" />
              <p class="text-xs opacity-60 mt-2 text-center">{{ progress }}%</p>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleFileSelect"
            >
          </label>
          <p v-if="uploadError" class="text-error text-xs mt-2">{{ uploadError }}</p>
        </fieldset>

        <!-- Tags -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{{ t('contests.tags') }}</legend>
          <TagsInputRoot
            v-model="tags"
            class="flex flex-wrap gap-2 items-center input w-full px-3 py-2 min-h-[2.5rem]"
            :max="10"
            add-on-paste
            :delimiter="/[,\n]/"
          >
            <TagsInputItem
              v-for="tag in tags"
              :key="tag"
              :value="tag"
              class="badge badge-outline gap-1 px-2 py-1"
            >
              <TagsInputItemText>{{ tag }}</TagsInputItemText>
              <TagsInputItemDelete class="btn btn-xs btn-ghost btn-circle p-0">×</TagsInputItemDelete>
            </TagsInputItem>
            <TagsInputInput
              :placeholder="t('contests.addTagPlaceholder')"
              class="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
            />
            <TagsInputClear v-if="tags.length > 0" class="btn btn-xs btn-ghost btn-circle p-0">×</TagsInputClear>
          </TagsInputRoot>
          <p class="label">{{ t('contests.noTags') }}</p>
        </fieldset>

        <!-- Terms Agreement -->
        <fieldset class="fieldset">
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                v-model="agreedToTerms"
                type="checkbox"
                required
                class="checkbox checkbox-primary"
              />
              <span class="label-text">
                {{ t('contests.agreeToTerms') }}
                <NuxtLink :to="localePath('/legal/dws-2026-terms')" class="link link-hover text-primary" target="_blank">
                  {{ t('contests.termsLink') }}
                </NuxtLink>
                {{ t('contests.agreeToTermsAnd') }}
                <NuxtLink :to="localePath('/legal/solar-network-dev')" class="link link-hover text-primary" target="_blank">
                  {{ t('contests.devTermsLink') }}
                </NuxtLink>
              </span>
            </label>
          </div>
        </fieldset>

        <div class="pt-2">
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="submitting || isUploading || !title || !description || !repoUrl || !agreedToTerms"
          >
            <span v-if="submitting" class="loading loading-spinner loading-sm" />
            <span v-else>{{ t('contests.submitProject') }}</span>
          </button>
          <p class="mt-3 text-center text-xs text-base-content/45">
            {{ t('contests.submitReviewNote') }}
          </p>
        </div>
        </form>
      </div>
    </section>
  </div>

  <div
    v-else-if="content && submitSuccess"
    class="px-4 py-20 text-center"
  >
    <div class="container mx-auto max-w-md">
      <h2 class="mb-3 text-3xl font-extrabold tracking-tight">
        {{ t('contests.submitted') }}
      </h2>
      <p class="mb-8 text-base-content/60">
        {{ t('contests.submittedMessage') }}
      </p>
      <NuxtLink
        :to="localePath(`/contests/${slug}`)"
        class="btn btn-primary"
      >
        {{ t('contests.backToContest') }}
      </NuxtLink>
    </div>
  </div>
</template>
