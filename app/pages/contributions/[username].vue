<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const username = computed(() => route.params.username as string)

const { data: profile, status } = await useAsyncData(
  `contribution-${username.value}`,
  () => $fetch<any>(`/api/contribution/${username.value}`),
)

useSeoMeta({
  title: () => profile.value
    ? `${profile.value.solarDisplayName} — ${t('seo.contributions.title')}`
    : t('seo.contributions.title'),
  description: () => profile.value
    ? `${profile.value.solarDisplayName}'s contribution profile on Solsynth.`
    : '',
})

const initial = computed(() => profile.value?.solarDisplayName?.[0] ?? '?')
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="shell loading">
      <span class="skeleton loading-banner" />
      <span class="skeleton loading-line" />
      <span class="skeleton loading-line short" />
    </div>

    <div v-else-if="!profile" class="shell empty">
      <p class="empty-title">
        {{ t('contributions.profileNotFound') }}
      </p>
      <NuxtLink :to="localePath('/contributions')" class="link-quiet">
        {{ t('contributions.backToLeaderboard') }}
      </NuxtLink>
    </div>

    <template v-else>
      <header class="shell head">
        <div
          class="banner"
          :style="profile.background ? { backgroundImage: `url(${profile.background})` } : undefined"
        />

        <div class="ident">
          <span class="avatar-frame">
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              :alt="profile.solarDisplayName"
              class="avatar"
              loading="eager"
              decoding="async"
            >
            <span v-else class="avatar avatar-empty" aria-hidden="true">{{ initial }}</span>
          </span>

          <div class="ident-text">
            <h1 class="title name">
              {{ profile.solarDisplayName }}
            </h1>
            <p class="handles">
              <a
                :href="`https://solian.app/@${profile.solarUsername}`"
                target="_blank"
                rel="noopener"
                class="handle"
              >
                @{{ profile.solarUsername }}
              </a>
              <a
                v-if="profile.githubUsername"
                :href="`https://github.com/${profile.githubUsername}`"
                target="_blank"
                rel="noopener"
                class="handle handle-github"
              >
                <img
                  :src="`https://github.com/${profile.githubUsername}.png`"
                  :alt="''"
                  class="handle-avatar"
                  loading="lazy"
                  decoding="async"
                >
                {{ profile.githubUsername }}
              </a>
            </p>
          </div>
        </div>
      </header>

      <div class="shell body">
        <p v-if="!profile.linked" class="note note-warning">
          {{ t('contributions.notLinked') }}
        </p>

        <template v-else>
          <dl class="figures">
            <div class="figure">
              <dt>{{ t('contributions.rank') }}</dt>
              <dd class="mono">
                #{{ profile.rank }}
              </dd>
            </div>
            <div class="figure">
              <dt>{{ t('contributions.pullRequests') }}</dt>
              <dd class="mono">
                {{ profile.prCount }}
              </dd>
            </div>
            <div class="figure">
              <dt>{{ t('contributions.issues') }}</dt>
              <dd class="mono">
                {{ profile.issueCount }}
              </dd>
            </div>
            <div class="figure">
              <dt>{{ t('contributions.commits') }}</dt>
              <dd class="mono">
                {{ profile.commitCount }}
              </dd>
            </div>
          </dl>

          <ContributionHeatmap
            v-if="profile.githubUsername"
            :username="profile.solarUsername"
            class="heatmap"
          />
        </template>
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

.empty {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  padding-block: 4rem;
}

.empty-title {
  margin: 0;
  font-size: 1.0625rem;
  color: var(--color-dim);
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

.handles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  margin: 0;
  font-size: 0.8125rem;
}

.handle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.handle:hover {
  color: var(--color-primary);
}

.handle-avatar {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: var(--color-base-300);
  object-fit: cover;
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

.heatmap {
  margin-top: 0.5rem;
}

@media (min-width: 640px) {
  .figures {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    max-width: 34rem;
  }
}
</style>
