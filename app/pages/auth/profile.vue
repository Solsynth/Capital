<script setup lang="ts">
import {
  CircleUser,
  Mail,
  ShieldCheck,
  ExternalLink,
  Zap,
  GitBranch,
  RefreshCw,
  ArrowLeft,
} from '@lucide/vue'
import { useSolarProfile, useSolarFileUrl } from '~/composables/useSolarProfile'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

let session: any = null
if (import.meta.server) {
  session = ref(await useServerSession())
}
else {
  const { data } = await useAuth().useSession(useFetch)
  session = data
}

const { data: solarProfile, loading: solarLoading, fetch: fetchSolar } = useSolarProfile()

const refreshing = ref(false)
async function handleRefresh() {
  refreshing.value = true
  try {
    await $fetch('/api/sn/refresh-profile', { method: 'POST' })
    await fetchSolar()
  }
  catch {
    // refresh is best-effort
  }
  finally {
    refreshing.value = false
  }
}

const pictureUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.picture))

const { status: claStatus, refresh: refreshCla } = useContribution()

const showEmail = ref(false)

const user = computed(() => {
  // session may be a Ref from useSession / useServerSession
  const s = session && typeof session === 'object' && 'value' in session
    ? session.value
    : session
  return s?.user ?? null
})

const displayName = computed(
  () => solarProfile.value?.nick || user.value?.name || '—',
)

onMounted(() => {
  void fetchSolar().catch(() => {})
  void refreshCla().catch(() => {})
})

useSeoMeta({
  title: () => t('nav.profile'),
  description: () => t('profile.subtitle'),
})
</script>

<template>
  <div>
    <header class="band">
      <div class="shell">
        <NuxtLink
          :to="localePath('/')"
          class="back"
        >
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('about.backToHome') }}
        </NuxtLink>

        <div class="masthead">
          <div class="avatar">
            <img
              v-if="pictureUrl"
              :src="pictureUrl"
              :alt="displayName"
              decoding="async"
            >
            <img
              v-else-if="user?.image"
              :src="user.image"
              :alt="displayName"
              decoding="async"
            >
            <CircleUser v-else class="avatar-icon" aria-hidden="true" />
            <span
              v-if="user?.emailVerified"
              class="avatar-badge"
              :title="t('profile.verified')"
            >
              <ShieldCheck class="avatar-badge-icon" aria-hidden="true" />
            </span>
          </div>

          <div class="masthead-text">
            <div v-if="solarLoading" class="loading-name">
              <span class="skeleton" />
            </div>
            <div v-else class="name-line">
              <h1 class="title page-title">
                {{ displayName }}
              </h1>
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square refresh"
                :disabled="refreshing"
                :aria-label="t('profile.refresh')"
                :title="t('profile.refresh')"
                @click="handleRefresh"
              >
                <span v-if="refreshing" class="spinner" aria-hidden="true" />
                <RefreshCw v-else class="icon" aria-hidden="true" />
              </button>
            </div>

            <p v-if="solarProfile?.name" class="mono handle">
              @{{ solarProfile.name }}
            </p>

            <p
              v-if="solarProfile?.perk_subscription?.is_active"
              class="perk"
            >
              <Zap class="icon perk-icon" aria-hidden="true" />
              {{ solarProfile.perk_subscription.display_name }}
              · Lv{{ solarProfile.perk_subscription.perk_level }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="body">
      <div class="shell sections">
        <section class="plate section">
          <h2 class="section-label">
            {{ t('profile.account') }}
          </h2>

          <dl class="details">
            <div class="detail">
              <dt class="detail-label">
                <Mail class="icon" aria-hidden="true" />
                {{ t('profile.email') }}
              </dt>
              <dd class="detail-value">
                <button
                  type="button"
                  class="email"
                  :class="{ 'is-shown': showEmail }"
                  @click="showEmail = true"
                >
                  {{ showEmail ? user?.email : t('profile.revealEmail') }}
                </button>
                <span v-if="user?.emailVerified" class="chip chip-verified">
                  {{ t('profile.verifiedShort') }}
                </span>
                <span v-else class="chip chip-pending">
                  {{ t('profile.unverified') }}
                </span>
              </dd>
            </div>

            <div class="detail">
              <dt class="detail-label">
                <ShieldCheck class="icon" aria-hidden="true" />
                {{ t('profile.id') }}
              </dt>
              <dd class="detail-value mono">
                {{ user?.id }}
              </dd>
            </div>
          </dl>
        </section>

        <section class="plate section">
          <h2 class="section-label">
            {{ t('profile.links') }}
          </h2>

          <dl class="details">
            <div v-if="solarProfile" class="detail">
              <dt class="detail-label">
                <ExternalLink class="icon" aria-hidden="true" />
                {{ t('profile.solarNetwork') }}
              </dt>
              <dd class="detail-value">
                <a
                  :href="`https://id.solian.app/@${solarProfile.name}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-quiet mono"
                >
                  @{{ solarProfile.name }}
                </a>
              </dd>
            </div>

            <div v-if="claStatus?.githubConnected" class="detail">
              <dt class="detail-label">
                <GitBranch class="icon" aria-hidden="true" />
                {{ t('profile.github') }}
              </dt>
              <dd class="detail-value detail-links">
                <a
                  :href="`https://github.com/${claStatus.githubUsername}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-quiet mono"
                >
                  @{{ claStatus.githubUsername }}
                </a>
                <span v-if="claStatus.signed" class="chip">
                  CLA
                </span>
                <NuxtLink
                  :to="localePath('/contributions/me')"
                  class="link-quiet view-contribution"
                >
                  {{ t('profile.viewContribution') }}
                </NuxtLink>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 2rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.75rem;
  color: var(--color-faint);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.back:hover {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.masthead {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.avatar {
  position: relative;
  display: flex;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border-radius: 999px;
  background: var(--color-base-200);
  color: var(--color-faint);
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-icon {
  width: 2rem;
  height: 2rem;
}

.avatar-badge {
  position: absolute;
  right: -0.15rem;
  bottom: -0.15rem;
  display: flex;
  width: 1.35rem;
  height: 1.35rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--color-success);
  color: var(--color-success-content);
}

.avatar-badge-icon {
  width: 0.8rem;
  height: 0.8rem;
}

.masthead-text {
  min-width: 0;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.page-title {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  overflow-wrap: anywhere;
}

.loading-name .skeleton {
  width: 10rem;
  height: 1.75rem;
}

.refresh {
  color: var(--color-faint);
}

.icon {
  width: 0.9rem;
  height: 0.9rem;
}

.handle {
  margin: 0.3rem 0 0;
}

.perk {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.5rem 0 0;
  padding: 0.15rem 0.55rem;
  border: 1px solid color-mix(in oklab, var(--color-warning) 40%, transparent);
  border-radius: 999px;
  color: var(--color-warning);
  font-size: 0.75rem;
  font-weight: 600;
}

.perk-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.body {
  padding-block: 2rem 4rem;
}

.sections {
  display: grid;
  gap: 1rem;
}

.section {
  padding: 1.375rem 1.5rem 1.5rem;
}

.details {
  display: grid;
  gap: 1.1rem;
  margin: 0.9rem 0 0;
}

.detail {
  min-width: 0;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-faint);
}

.detail-value {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0.3rem 0 0;
  font-size: 0.9375rem;
  color: var(--color-base-content);
  overflow-wrap: anywhere;
}

.detail-links {
  gap: 0.6rem;
}

.email {
  border: 0;
  padding: 0;
  background: none;
  font: inherit;
  color: var(--color-base-content);
  cursor: pointer;
  overflow-wrap: anywhere;
}

.email:not(.is-shown) {
  filter: blur(4px);
  user-select: none;
}

.chip-verified {
  border-color: color-mix(in oklab, var(--color-success) 40%, transparent);
  color: var(--color-success);
}

.chip-pending {
  border-color: color-mix(in oklab, var(--color-warning) 40%, transparent);
  color: var(--color-warning);
}

.view-contribution {
  font-size: 0.8125rem;
}

@media (min-width: 640px) {
  .details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.1rem 2rem;
  }
}
</style>
