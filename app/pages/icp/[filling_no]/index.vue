<script setup lang="ts">
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  User,
  Edit,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { data: authData } = await useAuth().useSession(useFetch)

const fillingNo = computed(() => route.params.filling_no as string)

interface SiteDetail {
  id: string
  filling_no: string
  domain: string
  name: string
  description?: string
  site_url: string
  icon?: string
  categories?: Record<string, boolean> | string[]
  approved_at?: string | null
  created: string
  updated: string
  iconUrl: string | null
  identity: {
    id: string
    name: string
    description?: string
    icon?: string
    iconUrl: string | null
  } | null
  owner: {
    id: string
    name: string
    email: string
  } | null
}

const { data, error } = await useAsyncData(
  `icp-site-${fillingNo.value}`,
  () => $fetch<{ site: SiteDetail }>('/api/icp/site', {
    params: { filling_no: fillingNo.value },
  }),
)

if (error.value || !data.value?.site) {
  navigateTo(localePath('/icp'))
}

const site = computed(() => data.value?.site)

const pageTitle = computed(() =>
  site.value ? `${site.value.name} - ${t('seo.icp.title')}` : '',
)

const isApproved = computed(() => Boolean(site.value?.approved_at))

const isOwner = computed(() => {
  if (!authData.value?.user || !site.value?.owner) return false
  return authData.value.user.id === site.value.owner.id
})

const pageDescription = computed(() => {
  if (!site.value) return ''
  return (
    site.value.description
    || (isApproved.value
      ? t('royIcp.site.certified')
      : t('royIcp.site.pendingApproval'))
  )
})

const categoryLabels: Record<string, string> = {
  official: 'categories.official',
  entertainment: 'categories.entertainment',
  technology: 'categories.technology',
  education: 'categories.education',
  social: 'categories.social',
  business: 'categories.business',
  personal: 'categories.personal',
  media: 'categories.media',
  community: 'categories.community',
  tools: 'categories.tools',
  blog: 'categories.blog',
}

const activeCategories = computed(() => {
  if (!site.value?.categories) return []
  const raw = site.value.categories
  const keys = Array.isArray(raw)
    ? raw
    : Object.entries(raw).filter(([, v]) => v).map(([k]) => k)
  return keys.map((key) => {
    const i18nKey = categoryLabels[key]
    return i18nKey ? t(i18nKey, key) : key
  })
})

useHead({
  title: pageTitle,
})

useSeoMeta({
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  twitterCard: 'summary',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})
</script>

<template>
  <div v-if="site">
    <header class="band">
      <div class="shell">
        <NuxtLink
          :to="localePath('/icp')"
          class="back"
        >
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('royIcp.site.back') }}
        </NuxtLink>

        <div class="masthead">
          <span class="site-mark">
            <img
              v-if="site.iconUrl"
              :src="site.iconUrl"
              :alt="site.name"
              decoding="async"
            >
            <Globe v-else class="site-mark-icon" aria-hidden="true" />
          </span>

          <div class="masthead-text">
            <h1 class="title page-title">
              {{ site.name }}
            </h1>
            <p class="site-facts">
              <span class="mono">{{ site.domain }}</span>
              <span class="site-status">
                <span
                  class="dot"
                  :class="isApproved ? 'is-approved' : 'is-pending'"
                  aria-hidden="true"
                />
                {{ isApproved ? t('royIcp.site.certified') : t('royIcp.site.pendingApproval') }}
              </span>
              <span class="mono">{{ t('royIcp.directory.icpNumber', { id: site.filling_no }) }}</span>
            </p>
          </div>
        </div>

        <div class="actions">
          <a
            :href="site.site_url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-sm"
          >
            <ExternalLink class="icon" aria-hidden="true" />
            {{ t('royIcp.site.visit') }}
          </a>
          <NuxtLink
            v-if="isOwner"
            :to="localePath(`/icp/${fillingNo}/edit`)"
            class="btn btn-ghost btn-sm"
          >
            <Edit class="icon" aria-hidden="true" />
            {{ t('royIcp.site.edit') }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="body">
      <div class="shell sections">
        <section v-if="site.description" class="plate section">
          <h2 class="section-label">
            {{ t('royIcp.site.about') }}
          </h2>
          <p class="section-text">
            {{ site.description }}
          </p>
        </section>

        <section v-if="site.identity" class="plate section">
          <h2 class="section-label">
            {{ t('royIcp.site.identity') }}
          </h2>
          <div class="identity">
            <span class="identity-mark">
              <img
                v-if="site.identity.iconUrl"
                :src="site.identity.iconUrl"
                :alt="site.identity.name"
                decoding="async"
              >
              <User v-else class="icon" aria-hidden="true" />
            </span>
            <div class="identity-text">
              <p class="identity-name">
                {{ site.identity.name }}
              </p>
              <p v-if="site.identity.description" class="identity-desc">
                {{ site.identity.description }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="activeCategories.length > 0" class="plate section">
          <h2 class="section-label">
            {{ t('royIcp.site.categories') }}
          </h2>
          <div class="chips">
            <span v-for="label in activeCategories" :key="label" class="chip">
              {{ label }}
            </span>
          </div>
        </section>

        <section class="plate section">
          <h2 class="section-label">
            {{ t('royIcp.site.certDetails') }}
          </h2>
          <dl class="details">
            <div class="detail">
              <dt class="detail-label">
                {{ t('royIcp.site.status') }}
              </dt>
              <dd class="detail-value">
                <span class="site-status">
                  <span
                    class="dot"
                    :class="isApproved ? 'is-approved' : 'is-pending'"
                    aria-hidden="true"
                  />
                  {{ isApproved ? t('royIcp.site.certified') : t('royIcp.site.pendingApproval') }}
                </span>
              </dd>
            </div>
            <div v-if="site.approved_at" class="detail">
              <dt class="detail-label">
                {{ t('royIcp.site.certifiedOn') }}
              </dt>
              <dd class="detail-value mono">
                {{ new Date(site.approved_at).toLocaleDateString() }}
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
  margin-bottom: 1.5rem;
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
  align-items: flex-start;
  gap: 1rem;
}

.site-mark {
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--color-base-200);
  color: var(--color-faint);
}

.site-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.site-mark-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.masthead-text {
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.5vw, 2.375rem);
  overflow-wrap: anywhere;
}

.site-facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.9rem;
  margin: 0.5rem 0 0;
}

.site-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.dot.is-approved {
  background: var(--color-success);
}

.dot.is-pending {
  background: var(--color-warning);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.icon {
  width: 0.9rem;
  height: 0.9rem;
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

.section-text {
  margin: 0.6rem 0 0;
  max-width: 40rem;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-dim);
}

.identity {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-top: 0.75rem;
}

.identity-mark {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-300);
  color: var(--color-faint);
}

.identity-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-text {
  min-width: 0;
}

.identity-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.identity-desc {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.details {
  display: grid;
  gap: 0.85rem 2rem;
  margin: 0.75rem 0 0;
}

.detail-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-faint);
}

.detail-value {
  margin: 0.15rem 0 0;
  font-size: 0.875rem;
  color: var(--color-base-content);
}

@media (min-width: 640px) {
  .details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
