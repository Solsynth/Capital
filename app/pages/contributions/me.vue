<script setup lang="ts">
import { Trophy, FileCheck, GitPullRequest, ExternalLink, Loader2, CheckCircle, AlertCircle, CircleXIcon } from '@lucide/vue'
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

const { status: contribution, loading, error, refresh, sign } = useContribution()
const { data: solarProfile, fetch: fetchSolar } = useSolarProfile()

await Promise.all([refresh(), fetchSolar()])

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

useSeoMeta({
  title: t('seo.contributions.title'),
  description: t('seo.contributions.description'),
})
</script>

<template>
  <div class="container mx-auto px-8 py-16 max-w-3xl">
    <div class="flex items-center gap-3 mb-2">
      <Trophy class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold">{{ t('contributions.myTitle') }}</h1>
    </div>
    <p class="text-lg opacity-70 mb-10">{{ t('contributions.mySubtitle') }}</p>

    <!-- Loading -->
    <div v-if="loading && !contribution" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="contribution">
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <!-- CLA -->
        <div class="card bg-base-200 p-5 text-center">
          <component
            :is="contribution.signed ? CheckCircle : AlertCircle"
            class="w-7 h-7 mx-auto mb-2"
            :class="contribution.signed ? 'text-success' : 'text-warning'"
          />
          <p class="text-sm font-medium">
            {{ contribution.signed ? t('contributions.claSigned') : t('contributions.claNotSigned') }}
          </p>
          <p class="text-xs opacity-50 mt-1">{{ t('contributions.claStatus') }}</p>
        </div>

        <!-- PRs -->
        <div class="card bg-base-200 p-5 text-center">
          <GitPullRequest class="w-7 h-7 mx-auto mb-2 text-info" />
          <p class="text-2xl font-bold">{{ contribution.prCount ?? '—' }}</p>
          <p class="text-xs opacity-50 mt-1">{{ t('contributions.pullRequests') }}</p>
        </div>

        <!-- GitHub -->
        <div class="card bg-base-200 p-5 text-center">
          <img
            v-if="contribution.githubUsername"
            :src="`https://github.com/${contribution.githubUsername}.png`"
            :alt="contribution.githubUsername"
            class="w-10 h-10 rounded-full mx-auto mb-2"
          >
          <div v-else class="avatar placeholder mb-2 mx-auto">
            <div class="bg-neutral text-neutral-content w-10 rounded-full">
              <span class="text-sm">?</span>
            </div>
          </div>
          <p class="text-sm font-medium truncate">{{ contribution.githubUsername ?? '—' }}</p>
          <p class="text-xs opacity-50 mt-1">GitHub</p>
        </div>
      </div>

      <!-- GitHub not connected -->
      <div v-if="!contribution.githubConnected" class="card bg-warning/10 border border-warning/30 p-6 mb-6">
        <div class="flex items-center gap-3 mb-2">
          <AlertCircle class="w-5 h-5 text-warning" />
          <h2 class="font-semibold">{{ t('cla.githubNotConnected') }}</h2>
        </div>
        <p class="text-sm opacity-80 mb-3">{{ t('cla.connectGithubFirst') }}</p>
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

      <!-- CLA signed details -->
      <div v-else-if="contribution.signed" class="card bg-success/10 border border-success/30 p-6 mb-6">
        <div class="flex items-center gap-3 mb-2">
          <CheckCircle class="w-5 h-5 text-success" />
          <h2 class="font-semibold">{{ t('cla.alreadySigned') }}</h2>
        </div>
        <div class="text-sm opacity-80 space-y-1">
          <p>{{ t('cla.version') }}: {{ contribution.signature?.claVersion }}</p>
          <p>{{ t('cla.signedAt') }}: {{ new Date(contribution.signature!.signedAt).toLocaleString() }}</p>
        </div>
      </div>

      <!-- CLA not signed — prompt to sign -->
      <div v-else class="card bg-base-200 p-6 flex items-center justify-between mb-6">
        <div class="flex flex-col text-center items-center mb-4">
          <CircleXIcon class="mb-3 w-10 h-10 opacity-70" />
          <h2 class="font-semibold">{{ t('contributions.signClaPrompt') }}</h2>
          <p class="text-sm opacity-70">{{ t('contributions.signClaPromptDesc') }}</p>
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
              <!-- Header -->
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

              <!-- Scrollable CLA body -->
              <div
                ref="claBody"
                class="flex-1 overflow-y-auto px-6 py-6 prose prose-sm max-w-none"
                @scroll="onScroll"
              >
                <ContentRenderer v-if="claContent" :value="claContent" />
              </div>

              <!-- Scroll hint -->
              <div
                v-if="!scrolledToBottom"
                class="shrink-0 px-6 py-2 text-center text-xs opacity-60 border-t border-base-300"
              >
                ↓ {{ t('cla.scrollToBottom') }}
              </div>

              <!-- Footer -->
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

      <!-- Links -->
      <div class="flex gap-3">
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
          <ExternalLink class="w-4 h-4" />
          GitHub
        </a>
      </div>
    </template>
  </div>
</template>
