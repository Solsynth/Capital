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

const slug = computed(() => route.params?.slug as string)
const submissionId = computed(() => route.params?.id as string)

const { data: content } = await useAsyncData(`contest-edit-${locale.value}-${slug.value}`, async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', `/contests/${locale.value}/%`)
    .all()
  return allContests.find(c => c.path === `/contests/${locale.value}/${slug.value}`) || null
})

const { data: sub } = await useAsyncData(`submission-${submissionId.value}`, () => {
  return $fetch(`/api/contests/submissions/${submissionId.value}`)
})

if (!content.value || !sub.value) {
  navigateTo(localePath(`/contests/${slug.value}/mine`))
}

const title = ref(sub.value?.data?.title || '')
const description = ref(sub.value?.data?.description || '')
const note = ref(sub.value?.data?.note || '')
const repoUrl = ref(sub.value?.data?.repo_url || '')
const tags = ref<string[]>(sub.value?.data?.tags || [])
const screenshots = ref<string[]>(sub.value?.data?.screenshots || [])
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

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
  saveError.value = ''
  saving.value = true

  try {
    await $fetch(`/api/contests/submissions/${submissionId.value}`, {
      method: 'PUT',
      body: {
        title: title.value,
        description: description.value,
        note: note.value || undefined,
        repo_url: repoUrl.value || undefined,
        screenshots: screenshots.value,
        tags: tags.value,
      },
    })
    saveSuccess.value = true
  }
  catch (e: any) {
    saveError.value = e.data?.statusMessage || 'Update failed'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="content && sub && !saveSuccess" class="container mx-auto px-4 py-12">
    <div class="max-w-2xl mx-auto">
      <NuxtLink
        :to="localePath(`/contests/${slug}/mine`)"
        class="btn btn-ghost btn-sm mb-6 inline-flex"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        {{ t('contests.mySubmissions') }}
      </NuxtLink>

      <!-- Status Notice -->
      <div v-if="sub.status === 'pending'" class="alert alert-info alert-sm mb-6">
        {{ t('contests.pendingReview') }}
      </div>
      <div v-else-if="sub.status === 'rejected'" class="alert alert-error alert-sm mb-6">
        <div>
          <div class="font-medium">{{ t('contests.rejectedNotice') }}</div>
          <div v-if="sub.reviewNote" class="text-sm mt-1">{{ sub.reviewNote }}</div>
        </div>
      </div>

      <div v-if="saveError" class="alert alert-error mb-6">
        {{ saveError }}
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
            <div v-for="(url, idx) in screenshots" :key="idx" class="relative group rounded-lg overflow-hidden">
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
            <input type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect">
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
        </fieldset>

        <!-- Submit -->
        <div class="pt-4">
          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            :disabled="saving || !title || !description || !repoUrl"
          >
            <span v-if="saving" class="loading loading-spinner loading-sm" />
            <span v-else-if="sub.status === 'rejected'">{{ t('contests.resubmit') }}</span>
            <span v-else>{{ t('contests.saveChanges') }}</span>
          </button>
          <p class="text-xs opacity-50 text-center mt-3">{{ t('contests.editNote') }}</p>
        </div>
      </form>
    </div>
  </div>

  <!-- Success -->
  <div v-else-if="saveSuccess" class="container mx-auto px-4 py-20 text-center">
    <div class="max-w-md mx-auto">
      <CheckCircle class="w-16 h-16 text-success mx-auto mb-4" />
      <h2 class="text-3xl font-bold mb-4">{{ t('contests.updated') }}</h2>
      <p class="opacity-70 mb-8">{{ t('contests.updatedMessage') }}</p>
      <NuxtLink :to="localePath(`/contests/${slug}/mine`)" class="btn btn-primary">
        {{ t('contests.mySubmissions') }}
      </NuxtLink>
    </div>
  </div>
</template>
