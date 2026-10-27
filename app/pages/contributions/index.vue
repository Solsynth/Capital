<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useAsyncData('leaderboard', () =>
  $fetch<{ leaderboard: Array<{
    rank: number
    githubUsername: string
    solarUsername: string | null
    solarDisplayName: string | null
    prCount: number
    issueCount: number
    commitCount: number
    total: number
  }> }>('/api/contribution/leaderboard'),
)

useSeoMeta({
  title: t('seo.contributions.title'),
  description: t('seo.contributions.description'),
})

// Score is weighted: a merged pull request counts for five, an issue for
// three, and a commit for one.
function score(row: { prCount: number, issueCount: number, commitCount: number }) {
  return row.prCount * 5 + row.issueCount * 3 + row.commitCount
}
</script>

<template>
  <div>
    <header class="band">
      <div class="shell">
        <h1 class="title page-title">
          {{ t('contributions.leaderboard') }}
        </h1>
        <p class="lede page-lede">
          {{ t('contributions.leaderboardDesc') }}
        </p>
      </div>
    </header>

    <section class="body">
      <div class="shell">
        <div v-if="status === 'pending'" class="skeleton-block">
          <span v-for="i in 6" :key="i" class="skeleton skeleton-row" />
        </div>

        <div v-else-if="data?.leaderboard?.length" class="table-scroll">
          <table class="ledger">
            <thead>
              <tr>
                <th class="col-rank">
                  {{ t('contributions.rank') }}
                </th>
                <th>{{ t('contributions.contributor') }}</th>
                <th class="col-figure">
                  {{ t('contributions.pullRequests') }}
                </th>
                <th class="col-figure">
                  {{ t('contributions.issues') }}
                </th>
                <th class="col-figure">
                  {{ t('contributions.commits') }}
                </th>
                <th class="col-figure col-score">
                  {{ t('contributions.score') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data.leaderboard" :key="row.rank">
                <td class="col-rank">
                  <span class="mono rank" :class="{ 'is-top': row.rank <= 3 }">
                    {{ row.rank }}
                  </span>
                </td>

                <td>
                  <NuxtLink
                    v-if="row.solarUsername"
                    :to="localePath(`/contributions/${row.solarUsername}`)"
                    class="who"
                  >
                    <img
                      :src="`https://api.solian.app/stargate/accounts/${row.solarUsername}/picture`"
                      :alt="''"
                      loading="lazy"
                      decoding="async"
                      class="who-avatar"
                    >
                    <span class="who-text">
                      <span class="who-name">{{ row.solarDisplayName || row.solarUsername }}</span>
                      <span class="mono who-handle">@{{ row.solarUsername }}</span>
                    </span>
                  </NuxtLink>
                  <span v-else class="who">
                    <span class="who-avatar who-avatar-empty" aria-hidden="true" />
                    <span class="who-text">
                      <span class="who-name">{{ row.solarDisplayName || row.githubUsername }}</span>
                      <span class="mono who-handle">{{ row.githubUsername }}</span>
                    </span>
                  </span>
                </td>

                <td class="col-figure mono">
                  {{ row.prCount }}
                </td>
                <td class="col-figure mono">
                  {{ row.issueCount }}
                </td>
                <td class="col-figure mono">
                  {{ row.commitCount }}
                </td>
                <td class="col-figure mono col-score">
                  {{ score(row) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="empty">
          {{ t('contributions.noData') }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.band {
  padding-block: 3.5rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.page-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.page-lede {
  margin: 0.75rem 0 0;
}

.body {
  padding-block: 2.25rem 4rem;
}

.table-scroll {
  overflow-x: auto;
}

.ledger {
  min-width: 34rem;
}

/* The ledger's header rule and row rules come from the shared table style;
   only the column set and the figures are set here. */
.col-rank {
  width: 4rem;
}

.col-figure {
  width: 6.5rem;
  text-align: right;
}

.col-score {
  width: 7rem;
}

.rank {
  display: inline-block;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.rank.is-top {
  color: var(--color-primary);
  font-weight: 600;
}

.who {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: inherit;
  text-decoration: none;
}

a.who:hover .who-name {
  color: var(--color-primary);
}

.who-avatar {
  width: 1.75rem;
  height: 1.75rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-base-300);
  object-fit: cover;
}

.who-text {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.who-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
  transition: color 140ms ease;
}

.who-handle {
  color: var(--color-faint);
}

.skeleton-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-block: 0.5rem;
}

.skeleton-row {
  height: 2.25rem;
  border-radius: var(--radius-mark);
}

.empty {
  margin: 0;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}
</style>
