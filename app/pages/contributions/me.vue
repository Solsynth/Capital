<script setup lang="ts">
import { FileCheck, ExternalLink, Loader2, CheckCircle, AlertCircle, GitCommitHorizontal } from '@lucide/vue'
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

const initial = computed(() => solarProfile.value?.nick?.[0] ?? '?')

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
  <div>
    <div v-if="loading && !contribution" class="shell loading">
      <span class="skeleton loading-banner" />
      <span class="skeleton loading-line" />
      <span class="skeleton loading-line short" />
    </div>

    <template v-else-if="contribution">
      <header class="shell head">
        <div
          class="banner"
          :style="backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined"
        />

        <div class="ident">
          <span class="avatar-frame">
            <img
              v-if="pictureUrl"
              :src="pictureUrl"
              :alt="solarProfile?.nick"
              class="avatar"
              loading="eager"
              decoding="async"
            >
            <span v-else class="avatar avatar-empty" aria-hidden="true">{{ initial }}</span>
          </span>

          <div class="ident-text">
            <h1 class="title name">
              {{ solarProfile?.nick || t('contributions.myTitle') }}
            </h1>
            <p class="subtitle">
              {{ t('contributions.mySubtitle') }}
            </p>
          </div>

          <button
            v-if="contribution.githubConnected"
            class="btn btn-ghost refresh"
            :disabled="refreshing"
            @click="handleRefresh()"
          >
            <Loader2 v-if="refreshing" class="refresh-icon spin" aria-hidden="true" />
            <GitCommitHorizontal v-else class="refresh-icon" aria-hidden="true" />
            {{ t('contributions.refreshStats') }}
          </button>
        </div>
      </header>

      <div class="shell body">
        <dl class="figures">
          <div class="figure">
            <dt>{{ t('contributions.claStatus') }}</dt>
            <dd class="stat-status" :class="contribution.signed ? 'is-signed' : 'is-unsigned'">
              <span class="dot" :class="contribution.signed ? 'dot-signed' : 'dot-unsigned'" />
              {{ contribution.signed ? t('contributions.claSigned') : t('contributions.claNotSigned') }}
            </dd>
          </div>
          <div class="figure">
            <dt>{{ t('contributions.pullRequests') }}</dt>
            <dd class="mono">
              {{ contribution.prCount }}
            </dd>
          </div>
          <div class="figure">
            <dt>{{ t('contributions.issues') }}</dt>
            <dd class="mono">
              {{ contribution.issueCount }}
            </dd>
          </div>
          <div class="figure">
            <dt>{{ t('contributions.commits') }}</dt>
            <dd class="mono">
              {{ contribution.commitCount }}
            </dd>
          </div>
        </dl>

        <ContributionHeatmap
          v-if="solarProfile?.name && contribution.githubUsername"
          :key="refreshHeatmapKey"
          :username="solarProfile.name"
          class="heatmap"
        />

        <section v-if="!contribution.githubConnected" class="plate block">
          <h2 class="block-title">
            <AlertCircle class="block-icon icon-warning" aria-hidden="true" />
            {{ t('cla.githubNotConnected') }}
          </h2>
          <p class="block-note">
            {{ t('cla.connectGithubFirst') }}
          </p>
          <a
            href="https://solian.app/settings/connections"
            target="_blank"
            rel="noopener"
            class="btn block-action"
          >
            {{ t('cla.connectOnSolar') }}
            <ExternalLink class="btn-icon" aria-hidden="true" />
          </a>
        </section>

        <section v-else-if="contribution.signed" class="plate block">
          <h2 class="block-title">
            <CheckCircle class="block-icon icon-success" aria-hidden="true" />
            {{ t('cla.alreadySigned') }}
          </h2>
          <dl class="block-facts">
            <div class="block-fact">
              <dt>{{ t('cla.version') }}</dt>
              <dd class="mono">
                {{ contribution.signature?.claVersion }}
              </dd>
            </div>
            <div class="block-fact">
              <dt>{{ t('cla.signedAt') }}</dt>
              <dd class="mono">
                {{ new Date(contribution.signature!.signedAt).toLocaleDateString() }}
              </dd>
            </div>
          </dl>
        </section>

        <section v-else class="plate block">
          <div class="block-head">
            <div>
              <h2 class="block-title">
                <FileCheck class="block-icon" aria-hidden="true" />
                {{ t('contributions.signClaPrompt') }}
              </h2>
              <p class="block-note">
                {{ t('contributions.signClaPromptDesc') }}
              </p>
            </div>

            <DialogRoot v-model:open="dialogOpen" @update:open="onDialogOpen">
              <DialogTrigger as-child>
                <button class="btn btn-primary">
                  <FileCheck class="btn-icon" aria-hidden="true" />
                  {{ t('cla.title') }}
                </button>
              </DialogTrigger>

              <DialogPortal>
                <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <DialogContent
                  class="dialog"
                  @open-auto-focus.prevent
                >
                  <div class="dialog-head">
                    <div>
                      <DialogTitle class="dialog-title">
                        {{ t('cla.title') }}
                      </DialogTitle>
                      <DialogDescription class="dialog-desc">
                        {{ t('cla.connectedAs') }} <strong>{{ contribution.githubUsername }}</strong>
                      </DialogDescription>
                    </div>
                    <DialogClose as-child>
                      <button class="btn btn-ghost btn-sm btn-circle" :aria-label="t('common.back')">
                        ✕
                      </button>
                    </DialogClose>
                  </div>

                  <div
                    ref="claBody"
                    class="prose dialog-body"
                    @scroll="onScroll"
                  >
                    <ContentRenderer v-if="claContent" :value="claContent" />
                  </div>

                  <p v-if="!scrolledToBottom" class="dialog-hint">
                    {{ t('cla.scrollToBottom') }}
                  </p>

                  <div class="dialog-foot">
                    <p v-if="error" class="note note-error">
                      {{ error }}
                    </p>
                    <div v-else />

                    <div class="dialog-actions">
                      <DialogClose as-child>
                        <button class="btn btn-ghost btn-sm">{{ t('common.back') }}</button>
                      </DialogClose>
                      <button
                        class="btn btn-primary btn-sm"
                        :disabled="!scrolledToBottom || loading"
                        @click="handleSign()"
                      >
                        <Loader2 v-if="loading" class="btn-icon spin" aria-hidden="true" />
                        <FileCheck v-else class="btn-icon" aria-hidden="true" />
                        {{ t('cla.agreeAndSign') }}
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </DialogPortal>
            </DialogRoot>
          </div>
        </section>

        <div class="links">
          <NuxtLink
            v-if="solarProfile?.name"
            :to="localePath(`/contributions/${solarProfile.name}`)"
            class="btn btn-ghost btn-sm"
          >
            {{ t('contributions.viewPublicProfile') }}
          </NuxtLink>
          <a
            v-if="contribution.githubUsername"
            :href="`https://github.com/${contribution.githubUsername}`"
            target="_blank"
            rel="noopener"
            class="btn btn-ghost btn-sm"
          >
            <img
              :src="`https://github.com/${contribution.githubUsername}.png`"
              :alt="''"
              class="link-avatar"
              loading="lazy"
              decoding="async"
            >
            {{ contribution.githubUsername }}
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-block: 2.5rem 4rem;
}

.loading-banner {
  height: 11rem;
  border-radius: var(--radius-card);
}

.loading-line {
  height: 1.25rem;
  max-width: 24rem;
}

.loading-line.short {
  max-width: 14rem;
}

.head {
  padding-top: 2rem;
}

.banner {
  height: 11rem;
  border-radius: var(--radius-card);
  background-color: var(--color-base-300);
  background-position: center;
  background-size: cover;
}

.ident {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.1rem;
  margin-top: -2.5rem;
  padding-inline: 0.75rem;
}

/* The frame is the page surface, not a border: it separates the avatar from
   whatever the banner happens to be. */
.avatar-frame {
  display: block;
  flex: none;
  padding: 3px;
  border-radius: calc(var(--radius-card) + 3px);
  background: var(--color-base-100);
}

.avatar {
  display: block;
  width: 6rem;
  height: 6rem;
  border-radius: var(--radius-card);
  background: var(--color-base-300);
  object-fit: cover;
}

.avatar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-faint);
}

.ident-text {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  padding-bottom: 0.35rem;
}

.name {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  margin: 0;
  max-width: 28rem;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.refresh {
  margin-left: auto;
  margin-bottom: 0.35rem;
}

.refresh-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.body {
  padding-block: 2.25rem 4rem;
}

.figures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 2rem;
  margin: 0 0 2.25rem;
}

.figure {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.figure dt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-faint);
}

.figure dd {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.1;
  color: var(--color-base-content);
}

.figure-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

.dot-signed {
  background: var(--color-success);
}

.dot-unsigned {
  background: var(--color-warning);
}

.heatmap {
  margin-top: 0.5rem;
}

.block {
  margin-top: 1.25rem;
  padding: 1.25rem;
}

.block-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.4rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.block-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-faint);
}

.icon-warning {
  color: var(--color-warning);
}

.icon-success {
  color: var(--color-success);
}

.block-note {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.block-action {
  margin-top: 1rem;
}

.block-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
}

.block-fact {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  font-size: 0.8125rem;
}

.block-fact dt {
  color: var(--color-faint);
}

.block-fact dd {
  margin: 0;
  color: var(--color-base-content);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.link-avatar {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: var(--color-base-300);
  object-fit: cover;
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.spin {
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* The dialog is a sheet, not a card: one radius, no shadow, a surface lighter
   than the page behind the scrim. */
.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 50;
  display: flex;
  width: min(100%, 48rem);
  max-height: 85vh;
  flex-direction: column;
  overflow: hidden;
  transform: translate(-50%, -50%);
  border-radius: var(--radius-sheet);
  background: var(--color-base-100);
}

.dialog-head {
  display: flex;
  flex: none;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.dialog-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-base-content);
}

.dialog-desc {
  margin: 0.3rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
  max-width: none;
}

.dialog-hint {
  flex: none;
  margin: 0;
  padding: 0.5rem 1.5rem;
  border-top: 1px solid var(--color-line-soft);
  font-size: 0.75rem;
  color: var(--color-faint);
  text-align: center;
}

.dialog-foot {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-line-soft);
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

@media (min-width: 640px) {
  .figures {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    max-width: 40rem;
  }

  .block {
    padding: 1.5rem;
  }
}
</style>
