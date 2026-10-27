<script setup lang="ts">
import {
  ArrowLeft,
  Plus,
} from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: t('royIcp.mySubmissions.title'),
})

interface Submission {
  id: string
  type: 'create' | 'update'
  status: 'pending' | 'approved' | 'rejected'
  site_id: string | null
  data: {
    domain: string
    name: string
    description?: string
    site_url: string
    categories?: string[]
    identity_id?: string
    identity_name?: string
    identity_description?: string
  }
  review_note?: string
  reviewed_at?: string
  created: string
  site_filling_no?: string
  site_name?: string
}

const { data: submissionsData } = await useAsyncData(
  'icp-my-submissions',
  () => $fetch<{ submissions: Submission[] }>('/api/icp/submissions'),
)

const submissions = computed(() => submissionsData.value?.submissions ?? [])

function getStatusLabel(status: string) {
  return t(`royIcp.mySubmissions.${status}`, status)
}

function getTypeLabel(type: string) {
  return type === 'create'
    ? t('royIcp.mySubmissions.create')
    : t('royIcp.mySubmissions.update')
}
</script>

<template>
  <div>
    <header class="band">
      <div class="shell">
        <NuxtLink
          :to="localePath('/icp')"
          class="back"
        >
          <ArrowLeft class="back-icon" aria-hidden="true" />
          {{ t('common.back') }}
        </NuxtLink>

        <div class="masthead">
          <div>
            <h1 class="title page-title">
              {{ t('royIcp.mySubmissions.title') }}
            </h1>
            <p class="lede page-lede">
              {{ t('royIcp.mySubmissions.desc') }}
            </p>
          </div>

          <NuxtLink
            :to="localePath('/icp/submit')"
            class="btn btn-primary btn-sm"
          >
            <Plus class="icon" aria-hidden="true" />
            {{ t('royIcp.mySubmissions.new') }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="body">
      <div class="shell">
        <p v-if="submissions.length === 0" class="empty">
          {{ t('royIcp.mySubmissions.empty') }}
          <NuxtLink :to="localePath('/icp/submit')" class="link-quiet">
            {{ t('royIcp.mySubmissions.submitNew') }}
          </NuxtLink>
        </p>

        <div v-else class="scroll">
          <table class="ledger">
            <thead>
              <tr>
                <th scope="col">
                  {{ t('royIcp.submit.siteName') }}
                </th>
                <th scope="col">
                  {{ t('royIcp.identities.type') }}
                </th>
                <th scope="col">
                  {{ t('royIcp.site.status') }}
                </th>
                <th scope="col">
                  {{ t('royIcp.mySubmissions.submitted') }}
                </th>
                <th scope="col">
                  <span class="sr-only">{{ t('royIcp.mySubmissions.viewSite') }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in submissions" :key="sub.id">
                <td class="cell-site">
                  <p class="entry-name">
                    {{ sub.data.name }}
                  </p>
                  <p class="mono entry-domain">
                    {{ sub.data.domain }}
                  </p>
                  <p v-if="sub.data.description" class="entry-desc">
                    {{ sub.data.description }}
                  </p>
                  <div v-if="sub.data.categories?.length" class="entry-chips">
                    <span v-for="cat in sub.data.categories" :key="cat" class="chip">
                      {{ cat }}
                    </span>
                  </div>
                  <div
                    v-if="sub.data.identity_name || sub.data.identity_description"
                    class="entry-aside"
                  >
                    <p class="entry-aside-label">
                      {{ t('royIcp.mySubmissions.identityUpdates') }}
                    </p>
                    <p v-if="sub.data.identity_name" class="entry-aside-text">
                      {{ sub.data.identity_name }}
                    </p>
                    <p v-if="sub.data.identity_description" class="entry-aside-text">
                      {{ sub.data.identity_description }}
                    </p>
                  </div>
                  <p v-if="sub.review_note" class="note review-note">
                    {{ t('royIcp.mySubmissions.reviewNote') }}: {{ sub.review_note }}
                  </p>
                </td>

                <td>
                  <span class="chip">{{ getTypeLabel(sub.type) }}</span>
                </td>

                <td>
                  <span class="status">
                    <span
                      class="dot"
                      :class="`is-${sub.status}`"
                      aria-hidden="true"
                    />
                    {{ getStatusLabel(sub.status) }}
                  </span>
                </td>

                <td class="mono cell-date">
                  {{ new Date(sub.created).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA') }}
                </td>

                <td class="cell-action">
                  <NuxtLink
                    v-if="sub.status === 'approved' && sub.site_filling_no"
                    :to="localePath(`/icp/${sub.site_filling_no}`)"
                    class="link-quiet entry-link"
                  >
                    {{ t('royIcp.mySubmissions.viewSite') }}
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 2rem 2.25rem;
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
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: clamp(1.75rem, 3.5vw, 2.375rem);
}

.page-lede {
  margin: 0.6rem 0 0;
}

.icon {
  width: 0.9rem;
  height: 0.9rem;
}

.body {
  padding-block: 2rem 4rem;
}

.scroll {
  overflow-x: auto;
}

.ledger {
  min-width: 44rem;
}

.cell-site {
  width: 100%;
  min-width: 18rem;
}

.entry-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.entry-domain {
  margin: 0.15rem 0 0;
}

.entry-desc {
  margin: 0.45rem 0 0;
  max-width: 34rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-dim);
}

.entry-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.55rem;
}

.entry-aside {
  margin-top: 0.6rem;
  padding: 0.5rem 0.7rem;
  border-radius: var(--radius-chip);
  background: color-mix(in oklab, var(--color-base-200) 60%, transparent);
}

.entry-aside-label {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-faint);
}

.entry-aside-text {
  margin: 0.15rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.review-note {
  margin: 0.6rem 0 0;
  max-width: 34rem;
  border-color: var(--color-line);
  background: var(--color-base-200);
  color: var(--color-dim);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--color-dim);
  white-space: nowrap;
}

.dot.is-pending {
  background: var(--color-warning);
}

.dot.is-approved {
  background: var(--color-success);
}

.dot.is-rejected {
  background: var(--color-error);
}

.cell-date {
  color: var(--color-faint);
  white-space: nowrap;
}

.cell-action {
  white-space: nowrap;
}

.entry-link {
  font-size: 0.8125rem;
}

.empty {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
  padding: 2.25rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
