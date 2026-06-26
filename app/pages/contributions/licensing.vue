<script setup lang="ts">
import { FileCheck, CheckCircle, Loader2, ArrowLeft, ScrollText } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

let session: any = null
if (import.meta.server) {
  session = ref(await useServerSession())
} else {
  const { data } = await useAuth().useSession(useFetch)
  session = data
}

const { status, loading, error, refresh, sign } = useContribution()

const { data: claContent } = await useAsyncData(`cla-content-${locale.value}`, () => {
  return queryCollection('legal')
    .where('path', '=', `/legal/${locale.value}/contributor-license`)
    .first()
})

await refresh()

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: t('seo.cla.title'),
  description: t('seo.cla.description'),
})

// Scroll tracking for sign button
const claBody = ref<HTMLElement | null>(null)
const scrolledToBottom = ref(false)

function onScroll() {
  if (!claBody.value) return
  const { scrollTop, scrollHeight, clientHeight } = claBody.value
  scrolledToBottom.value = scrollTop + clientHeight >= scrollHeight - 32
}

// Sign
const signing = ref(false)
const signed = ref(false)

async function handleSign() {
  signing.value = true
  try {
    await sign()
    signed.value = true
    await refresh()
  } catch {} finally {
    signing.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100dvh-200px)]">
    <!-- Hero -->
    <div class="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-b border-base-content/5">
      <div class="container mx-auto max-w-3xl px-6 py-12">
        <NuxtLink :to="localePath('/contributions')" class="inline-flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity mb-6">
          <ArrowLeft class="w-3.5 h-3.5" />
          {{ t('contributions.backToLeaderboard') }}
        </NuxtLink>
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ScrollText class="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ t('cla.title') }}</h1>
            <p class="text-sm opacity-60 mt-0.5">{{ t('cla.description') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto max-w-3xl px-6 py-10">
      <!-- Already signed -->
      <div v-if="status?.claSigned" class="card bg-success/5 border border-success/20 p-8 text-center">
        <CheckCircle class="w-12 h-12 mx-auto mb-4 text-success" />
        <h2 class="text-xl font-bold mb-2">{{ t('cla.alreadySigned') }}</h2>
        <p class="text-sm opacity-60 mb-6">{{ t('cla.alreadySignedDesc') }}</p>
        <NuxtLink :to="localePath('/contributions/me')" class="btn btn-primary btn-sm">
          {{ t('contributions.viewProfile') }}
        </NuxtLink>
      </div>

      <!-- Not logged in -->
      <div v-else-if="!session?.user" class="card bg-base-200/60 border border-base-content/5 p-8 text-center">
        <FileCheck class="w-12 h-12 mx-auto mb-4 text-base-content/20" />
        <h2 class="text-xl font-bold mb-2">{{ t('cla.signInRequired') }}</h2>
        <p class="text-sm opacity-60 mb-6">{{ t('cla.signInDescription') }}</p>
        <NuxtLink :to="localePath('/auth/login')" class="btn btn-primary btn-sm">
          {{ t('auth.login') }}
        </NuxtLink>
      </div>

      <!-- CLA content + sign -->
      <template v-else>
        <div class="card bg-base-100 border border-base-content/10 shadow-sm overflow-hidden">
          <!-- CLA body -->
          <div
            ref="claBody"
            class="prose prose-sm max-w-none p-6 md:p-8 max-h-[60vh] overflow-y-auto border-b border-base-content/5"
            @scroll="onScroll"
          >
            <ContentRenderer v-if="claContent" :value="claContent" />
            <div v-else class="text-center py-8 opacity-50">
              <Loader2 class="w-5 h-5 animate-spin inline" />
              <p class="text-sm mt-2">{{ t('cla.loading') }}</p>
            </div>
          </div>

          <!-- Sign action -->
          <div class="p-6 md:p-8 bg-base-200/30">
            <!-- Error -->
            <div v-if="error" class="alert alert-error mb-4 text-sm">
              <span>{{ error }}</span>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium">{{ t('cla.readyToSign') }}</p>
                <p class="text-xs opacity-50 mt-0.5">
                  {{ scrolledToBottom ? t('cla.scrollComplete') : t('cla.scrollPrompt') }}
                </p>
              </div>
              <button
                class="btn btn-primary btn-sm"
                :disabled="!scrolledToBottom || signing || signed"
                @click="handleSign"
              >
                <Loader2 v-if="signing" class="w-4 h-4 animate-spin" />
                <CheckCircle v-else-if="signed" class="w-4 h-4" />
                <FileCheck v-else class="w-4 h-4" />
                {{ signed ? t('cla.signed') : t('cla.signButton') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
