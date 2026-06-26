<script setup lang="ts">
import { FileCheck, GitPullRequest, ExternalLink, Loader2, CheckCircle, AlertCircle, CircleDot, GitCommitHorizontal } from '@lucide/vue'
import { useSolarFileUrl } from '~/composables/useSolarProfile'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { status: contribution, loading, refreshing, error, nextRefreshAt, refresh, refreshStats, sign } = useContribution()
const { data: solarProfile, fetch: fetchSolar } = useSolarProfile()
const toast = useToast()
const refreshHeatmapKey = ref(0)

await Promise.all([refresh(), fetchSolar()])

const pictureUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.picture))
const backgroundUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.background, true))

const dialogOpen = ref(false)
const scrolledToBottom = ref(false)
const claBody = ref<HTMLElement | null>(null)

const { data: claContent } = await useAsyncData(`cla-content-${locale.value}`, () => {
  return queryCollection('legal')
    .where('path', '=', `/legal/${locale.value}/contributor-license`)
    .first()
})

function onScroll() {
  if (!claBody.value) return
  const { scrollTop, scrollHeight, clientHeight } = claBody.value
  scrolledToBottom.value = scrollHeight - clientHeight - scrollTop < 20
}

function onDialogOpen() {
  scrolledToBottom.value = false
}

async function handleSign() {
  await sign()
  if (!error.value) dialogOpen.value = false
}

async function handleRefresh() {
  const result = await refreshStats()
  if (result?.success) {
    refreshHeatmapKey.value++
    toast.success(t('contributions.refreshSuccess'))
  } else if (result?.error) {
    toast.error(result.error)
  }
}

useSeoMeta({
  title: t('seo.contributions.title'),
  description: t('seo.contributions.description'),
})
</script>

<template>
  <div class="min-h-[calc(100dvh-200px)]">
    <!-- Loading -->
    <div v-if="loading && !contribution" class="flex justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="contribution">
      <!-- Hero header -->
      <div class="relative">
        <!-- Background -->
        <div
          v-if="backgroundUrl"
          class="h-48 md:h-56 bg-cover bg-center -mt-(--site-page-offset,64px)"
          :style="{ backgroundImage: `url(${backgroundUrl})` }"
        />
        <div v-else class="h-48 md:h-56 bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20" />

        <!-- Content overlay -->
        <div class="container mx-auto max-w-3xl px-6">
          <div class="relative -mt-12 mb-6 flex items-end justify-between">
            <div class="flex items-end gap-4 pt-6">
              <!-- Avatar -->
              <div class="shrink-0">
                <img
                  v-if="pictureUrl"
                  :src="pictureUrl"
                  :alt="solarProfile?.nick"
                  class="w-24 h-24 rounded-2xl object-cover ring-4 ring-base-100 shadow-lg"
                >
                <div v-else class="w-24 h-24 rounded-2xl bg-base-300 flex items-center justify-center ring-4 ring-base-100 shadow-lg">
                  <span class="text-3xl font-bold text-base-content/30">{{ solarProfile?.nick?.[0] ?? '?' }}</span>
                </div>
              </div>

              <!-- Name -->
              <div class="min-w-0 pb-1">
                <h1 class="text-2xl font-bold truncate">{{ solarProfile?.nick || t('contributions.myTitle') }}</h1>
                <p class="text-sm opacity-60 mt-0.5">{{ t('contributions.mySubtitle') }}</p>
              </div>
            </div>

            <!-- Refresh button -->
            <button
              v-if="contribution.githubConnected"
              class="btn btn-ghost btn-sm gap-2 mb-1"
              :disabled="refreshing"
              @click="handleRefresh()"
            >
              <Loader2 v-if="refreshing" class="w-4 h-4 animate-spin" />
              <GitCommitHorizontal v-else class="w-4 h-4" />
              {{ t('contributions.refreshStats') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="container mx-auto max-w-3xl px-6 pb-16">
        <!-- Stats grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div class="card bg-base-200/60 border border-base-content/5 p-4 text-center">
            <component
              :is="contribution.signed ? CheckCircle : AlertCircle"
              class="w-6 h-6 mx-auto mb-1.5"
              :class="contribution.signed ? 'text-success' : 'text-warning'"
            />
            <p class="text-xs font-medium">
              {{ contribution.signed ? t('contributions.claSigned') : t('contributions.claNotSigned') }}
            </p>
          </div>

          <div class="card bg-base-200/60 border border-base-content/5 p-4 text-center">
            <GitPullRequest class="w-6 h-6 mx-auto mb-1.5 text-info" />
            <p class="text-xl font-bold tabular-nums">{{ contribution.prCount }}</p>
            <p class="text-xs opacity-50">{{ t('contributions.pullRequests') }}</p>
          </div>

          <div class="card bg-base-200/60 border border-base-content/5 p-4 text-center">
            <CircleDot class="w-6 h-6 mx-auto mb-1.5 text-warning" />
            <p class="text-xl font-bold tabular-nums">{{ contribution.issueCount }}</p>
            <p class="text-xs opacity-50">{{ t('contributions.issues') }}</p>
          </div>

          <div class="card bg-base-200/60 border border-base-content/5 p-4 text-center">
            <GitCommitHorizontal class="w-6 h-6 mx-auto mb-1.5 text-success" />
            <p class="text-xl font-bold tabular-nums">{{ contribution.commitCount }}</p>
            <p class="text-xs opacity-50">{{ t('contributions.commits') }}</p>
          </div>
        </div>

        <!-- Heatmap -->
        <ContributionHeatmap v-if="solarProfile?.name && contribution.githubUsername" :key="refreshHeatmapKey" :username="solarProfile.name" class="mb-6" />

        <!-- GitHub not connected -->
        <div v-if="!contribution.githubConnected" class="card bg-warning/10 border border-warning/30 p-5 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <AlertCircle class="w-5 h-5 text-warning" />
            <h2 class="font-semibold text-sm">{{ t('cla.githubNotConnected') }}</h2>
          </div>
          <p class="text-xs opacity-80 mb-3">{{ t('cla.connectGithubFirst') }}</p>
          <a
            href="https://solian.app/settings/connections"
            target="_blank"
            rel="noopener"
            class="btn btn-warning btn-sm gap-2"
          >
            {{ t('cla.connectOnSolar') }}
            <ExternalLink class="w-4 h-4" />
          </a>
        </div>

        <!-- CLA signed -->
        <div v-else-if="contribution.signed" class="card bg-success/5 border border-success/20 p-5 mb-6">
          <div class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-success shrink-0" />
            <div>
              <p class="text-sm font-medium">{{ t('cla.alreadySigned') }}</p>
              <p class="text-xs opacity-60">
                {{ t('cla.version') }}: {{ contribution.signature?.claVersion }}
                · {{ t('cla.signedAt') }}: {{ new Date(contribution.signature!.signedAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- CLA not signed -->
        <div v-else class="card bg-base-200/60 border border-base-content/5 p-5 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold">{{ t('contributions.signClaPrompt') }}</h2>
              <p class="text-xs opacity-60">{{ t('contributions.signClaPromptDesc') }}</p>
            </div>

            <DialogRoot v-model:open="dialogOpen" @update:open="onDialogOpen">
              <DialogTrigger as-child>
                <button class="btn btn-primary btn-sm gap-2">
                  <FileCheck class="w-4 h-4" />
                  {{ t('cla.title') }}
                </button>
              </DialogTrigger>

              <DialogPortal>
                <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <DialogContent
                  class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[85vh] bg-base-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                  @open-auto-focus.prevent
                >
                  <div class="flex items-center justify-between px-6 py-4 border-b border-base-300 shrink-0">
                    <div>
                      <DialogTitle class="text-lg font-bold">{{ t('cla.title') }}</DialogTitle>
                      <DialogDescription class="text-sm opacity-60">
                        {{ t('cla.connectedAs') }} <strong>{{ contribution.githubUsername }}</strong>
                      </DialogDescription>
                    </div>
                    <DialogClose as-child>
                      <button class="btn btn-ghost btn-sm btn-circle">✕</button>
                    </DialogClose>
                  </div>

                  <div
                    ref="claBody"
                    class="flex-1 overflow-y-auto px-6 py-6 prose prose-sm max-w-none"
                    @scroll="onScroll"
                  >
                    <ContentRenderer v-if="claContent" :value="claContent" />
                  </div>

                  <div
                    v-if="!scrolledToBottom"
                    class="shrink-0 px-6 py-2 text-center text-xs opacity-60 border-t border-base-300"
                  >
                    ↓ {{ t('cla.scrollToBottom') }}
                  </div>

                  <div class="shrink-0 px-6 py-4 border-t border-base-300 flex items-center justify-between">
                    <div v-if="error" class="text-sm text-error">{{ error }}</div>
                    <div v-else />
                    <div class="flex gap-3">
                      <DialogClose as-child>
                        <button class="btn btn-ghost btn-sm">{{ t('common.back') }}</button>
                      </DialogClose>
                      <button
                        class="btn btn-primary btn-sm gap-2"
                        :class="{ 'btn-disabled': !scrolledToBottom || loading }"
                        :disabled="!scrolledToBottom || loading"
                        @click="handleSign()"
                      >
                        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                        <FileCheck v-else class="w-4 h-4" />
                        {{ t('cla.agreeAndSign') }}
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </DialogPortal>
            </DialogRoot>
          </div>
        </div>

        <!-- Links -->
        <div class="flex gap-3 flex-wrap">
          <NuxtLink
            v-if="solarProfile?.name"
            :to="localePath(`/contributions/${solarProfile.name}`)"
            class="btn btn-outline btn-sm gap-2"
          >
            {{ t('contributions.viewPublicProfile') }}
          </NuxtLink>
          <a
            v-if="contribution.githubUsername"
            :href="`https://github.com/${contribution.githubUsername}`"
            target="_blank"
            rel="noopener"
            class="btn btn-outline btn-sm gap-2"
          >
            <img
              :src="`https://github.com/${contribution.githubUsername}.png`"
              :alt="contribution.githubUsername"
              class="w-4 h-4 rounded-full"
            >
            GitHub
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
