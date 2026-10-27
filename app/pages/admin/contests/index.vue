<script setup lang="ts">
import { Trophy } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()

const { data: contests } = await useAsyncData('admin-contests', async () => {
  const allContests = await queryCollection('contests')
    .where('path', 'LIKE', '/contests/en/%')
    .all()
  return allContests.map(c => ({
    ...c,
    slug: c.path.replace('/contests/en/', ''),
  }))
})

const { data: dbData } = await useAsyncData('admin-contests-db', () => {
  return $fetch('/api/contests')
})
const states = computed(() => ((dbData.value as any)?.states ?? {}) as Record<string, { phase?: string }>)
const submissionCounts = computed(() => ((dbData.value as any)?.submissionCounts ?? {}) as Record<string, number>)

function phaseOf(slug: string) {
  return states.value[slug]?.phase
}

function phaseLabel(phase?: string) {
  if (!phase) return ''
  return t(`admin.contests.phase${phase.charAt(0).toUpperCase()}${phase.slice(1)}`)
}

function phaseClass(phase?: string) {
  if (phase === 'voting') return 'status-live'
  if (phase === 'results') return 'status-ok'
  return 'status-warn'
}
</script>

<template>
  <div>
    <div class="admin-head">
      <h2 class="admin-h">
        {{ t('admin.contests.title') }}
      </h2>
      <p class="admin-sub">
        {{ t('admin.contests.subtitle') }}
      </p>
    </div>

    <ul v-if="(contests || []).length" class="contest-list">
      <li v-for="contest in (contests || [])" :key="contest.slug">
        <NuxtLink :to="`/admin/contests/${contest.slug}`" class="contest-row">
          <Trophy class="contest-glyph" aria-hidden="true" />
          <span class="contest-main">
            <span class="contest-title">{{ contest.title }}</span>
            <span v-if="contest.description" class="contest-desc">{{ contest.description }}</span>
          </span>
          <span class="contest-meta">
            <span class="mono">{{ submissionCounts[contest.slug] || 0 }} {{ t('admin.contests.submissions') }}</span>
            <span
              v-if="phaseOf(contest.slug)"
              class="status"
              :class="phaseClass(phaseOf(contest.slug))"
            >
              <span class="dot" aria-hidden="true" />
              {{ phaseLabel(phaseOf(contest.slug)) }}
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="empty">
      {{ t('admin.contests.noContests') }}
    </p>
  </div>
</template>

<style scoped>
.admin-head {
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-sub {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.contest-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line-soft);
}

.contest-row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 0.4rem 1rem 0;
  border-bottom: 1px solid var(--color-line-soft);
  color: inherit;
  text-decoration: none;
  transition: background-color 140ms ease;
}

.contest-row:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.contest-row:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.contest-glyph {
  width: 1rem;
  height: 1rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
  color: var(--color-primary);
}

.contest-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.contest-title {
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.contest-desc {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.8125rem;
  color: var(--color-faint);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.contest-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
  flex-shrink: 0;
  text-align: right;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status .dot {
  background: currentColor;
}

.status-ok {
  color: var(--color-success);
}

.status-warn {
  color: var(--color-warning);
}

.status-live {
  color: var(--color-primary);
}

.empty {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}
</style>
