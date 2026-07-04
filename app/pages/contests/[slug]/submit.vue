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

const { upload } = useFileUpload()

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  for (const file of Array.from(files)) {
    if (screenshots.value.length >= 10) break
    const result = await upload(file)
    if (result?.url) {
      screenshots.value.push(result.url)
    }
  }
  target.value = ''
}

function removeScreenshot(idx: number) {
  screenshots.value.splice(idx, 1)
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
  <div v-if="content && !submitSuccess" class="container mx-auto px-4 py-12">
    <div class="max-w-2xl mx-auto">
      <NuxtLink
        :to="localePath(`/contests/${slug}`)"
        class="btn btn-ghost btn-sm mb-6 inline-flex"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        {{ t('contests.backToContest') }}
      </NuxtLink>

      <!-- Contest Info -->
      <div class="card bg-base-200 mb-8">
        <div class="card-body">
          <h1 class="card-title text-2xl mb-2">{{ content.title }}</h1>
          <p class="opacity-70 text-sm">{{ content.description }}</p>
          <div v-if="content.tags?.length" class="flex flex-wrap gap-1 mt-3">
            <span v-for="tag in content.tags" :key="tag" class="badge badge-outline badge-xs">{{ tag }}</span>
          </div>
        </div>
      </div>

      <div v-if="submitError" class="alert alert-error mb-6">
        <span>{{ submitError }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="card bg-base-200 p-6 space-y-4">
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
              class="relative group rounded-lg overflow-hidden"
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
            class="border-2 border-dashed border-base-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload class="w-8 h-8 opacity-50 mb-2" />
            <span class="text-sm opacity-70">{{ t('contests.screenshotsUpload') }}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleFileSelect"
            >
          </label>
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

        <!-- Submit -->
        <div class="pt-4">
          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            :disabled="submitting || !title || !description || !repoUrl || !agreedToTerms"
          >
            <span v-if="submitting" class="loading loading-spinner loading-sm" />
            <span v-else>{{ t('contests.submitProject') }}</span>
          </button>
          <p class="text-xs opacity-50 text-center mt-3">
            {{ t('contests.submitReviewNote') }}
          </p>
        </div>
      </form>
    </div>
  </div>

  <!-- Success -->
  <div v-else-if="content && submitSuccess" class="container mx-auto px-4 py-20 text-center">
    <div class="max-w-md mx-auto">
      <h2 class="text-3xl font-bold mb-4">{{ t('contests.submitted') }}</h2>
      <p class="opacity-70 mb-8">
        {{ t('contests.submittedMessage') }}
      </p>
      <NuxtLink :to="localePath(`/contests/${slug}`)" class="btn btn-primary">
        {{ t('contests.backToContest') }}
      </NuxtLink>
    </div>
  </div>
</template>
