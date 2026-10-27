<script setup lang="ts">
import { FileCheck, CheckCircle, Loader2 } from '@lucide/vue'

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
  <div>
    <header class="band">
      <div class="shell">
        <NuxtLink :to="localePath('/contributions')" class="back">
          {{ t('contributions.backToLeaderboard') }}
        </NuxtLink>
        <h1 class="title page-title">
          {{ t('cla.title') }}
        </h1>
        <p class="lede page-lede">
          {{ t('cla.description') }}
        </p>
      </div>
    </header>

    <div class="shell body">
      <section v-if="status?.claSigned" class="plate block">
        <h2 class="block-title">
          <CheckCircle class="block-icon icon-success" aria-hidden="true" />
          {{ t('cla.alreadySigned') }}
        </h2>
        <p class="block-note">
          {{ t('cla.alreadySignedDesc') }}
        </p>
        <NuxtLink :to="localePath('/contributions/me')" class="btn block-action">
          {{ t('contributions.viewProfile') }}
        </NuxtLink>
      </section>

      <section v-else-if="!session?.user" class="plate block">
        <h2 class="block-title">
          <FileCheck class="block-icon" aria-hidden="true" />
          {{ t('cla.signInRequired') }}
        </h2>
        <p class="block-note">
          {{ t('cla.signInDescription') }}
        </p>
        <NuxtLink :to="localePath('/auth/login')" class="btn btn-primary block-action">
          {{ t('login.title') }}
        </NuxtLink>
      </section>

      <section v-else class="plate block reading">
        <div
          ref="claBody"
          class="prose clause"
          @scroll="onScroll"
        >
          <ContentRenderer v-if="claContent" :value="claContent" />
          <p v-else class="clause-loading">
            <Loader2 class="block-icon spin" aria-hidden="true" />
            {{ t('cla.loading') }}
          </p>
        </div>

        <div class="sign">
          <p v-if="error" class="note note-error sign-error">
            {{ error }}
          </p>

          <div class="sign-row">
            <div>
              <p class="sign-title">
                {{ t('cla.readyToSign') }}
              </p>
              <p class="sign-note">
                {{ scrolledToBottom ? t('cla.scrollComplete') : t('cla.scrollPrompt') }}
              </p>
            </div>
            <button
              class="btn btn-primary"
              :disabled="!scrolledToBottom || signing || signed"
              @click="handleSign"
            >
              <Loader2 v-if="signing" class="block-icon spin" aria-hidden="true" />
              <CheckCircle v-else-if="signed" class="block-icon" aria-hidden="true" />
              <FileCheck v-else class="block-icon" aria-hidden="true" />
              {{ signed ? t('cla.signed') : t('cla.signButton') }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 3.5rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--color-faint);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 140ms ease;
}

.back:hover {
  color: var(--color-base-content);
}

.page-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.page-lede {
  margin: 0.75rem 0 0;
}

.body {
  padding-block: 2.5rem 4rem;
}

.block {
  max-width: 44rem;
  padding: 1.5rem;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-base-content);
}

.block-icon {
  width: 1rem;
  height: 1rem;
  flex: none;
  color: var(--color-faint);
}

.icon-success {
  color: var(--color-success);
}

.block-note {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.block-action {
  margin-top: 1.25rem;
}

/* The clause scrolls inside the plate; the sign action is separated by
   spacing, not by a second border. */
.reading {
  padding: 0;
  overflow: hidden;
}

.clause {
  max-height: 60vh;
  margin: 0;
  padding: 1.5rem;
  overflow-y: auto;
}

.clause-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.sign {
  padding: 1.5rem;
  background: color-mix(in oklab, var(--color-base-100) 45%, transparent);
}

.sign-error {
  margin: 0 0 1rem;
}

.sign-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.sign-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.sign-note {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.spin {
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
