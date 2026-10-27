<script setup lang="ts">
import {
  Heart,
  Code,
  Users,
  Sparkles,
  ArrowLeft,
  ArrowUpRight,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const team = computed(() => [
  {
    name: 'LittleSheep',
    role: t('about.team.role.founder'),
    avatar: 'https://api.solian.app/stargate/accounts/littlesheep/picture',
    bio: t('about.team.littlesheep.bio'),
    profileUrl: 'https://id.solian.app/@littlesheep',
    github: 'https://github.com/LittleSheep2Code',
  },
])

const values = [
  { icon: Heart, key: 'love' },
  { icon: Code, key: 'opensource' },
  { icon: Users, key: 'community' },
  { icon: Sparkles, key: 'fun' },
]

// A readout, not a hero metric: the numbers sit on one line, in the mono face,
// the way the homepage prints its own figures.
const stats = computed(() => [
  { value: '02', suffix: '+', label: t('about.stats.years') },
  { value: '03', suffix: '+', label: t('about.stats.products') },
  { value: '1K', suffix: '+', label: t('about.stats.users') },
  { value: '100', suffix: '%', label: t('about.stats.passion') },
])
</script>

<template>
  <div class="about">
    <header class="shell masthead">
      <NuxtLink :to="localePath('/')" class="back">
        <ArrowLeft class="back-icon" aria-hidden="true" />
        {{ t('about.backToHome') }}
      </NuxtLink>

      <h1 class="display masthead-title">
        {{ t('about.title') }}
      </h1>
      <p class="lede masthead-lede">
        {{ t('about.subtitle') }}
      </p>
    </header>

    <section class="shell block">
      <h2 class="section-label">
        {{ t('about.mission.title') }}
      </h2>

      <div class="split">
        <div class="measure mission">
          <p>{{ t('about.mission.p1') }}</p>
          <p>{{ t('about.mission.p2') }}</p>
        </div>

        <div class="aside">
          <h3 class="aside-title">
            {{ t('about.didYouKnow.title') }}
          </h3>
          <ul class="aside-list">
            <li class="aside-item">
              <span class="dot aside-dot" aria-hidden="true" />
              <span>{{ t('about.didYouKnow.solsynth') }}</span>
            </li>
            <li class="aside-item">
              <span class="dot aside-dot" aria-hidden="true" />
              <span>{{ t('about.didYouKnow.chinese') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="shell block">
      <h2 class="section-label">
        {{ t('about.values.title') }}
      </h2>

      <ul class="values">
        <li v-for="value in values" :key="value.key" class="value-row">
          <component :is="value.icon" class="value-icon" aria-hidden="true" />
          <span class="value-title">
            {{ t(`about.values.${value.key}.title`) }}
          </span>
          <span class="value-desc">
            {{ t(`about.values.${value.key}.desc`) }}
          </span>
        </li>
      </ul>
    </section>

    <section class="shell block">
      <dl class="readout">
        <div v-for="stat in stats" :key="stat.label" class="readout-cell">
          <dt class="readout-label">
            {{ stat.label }}
          </dt>
          <dd class="readout-figure">
            <span>{{ stat.value }}</span><span class="readout-suffix">{{ stat.suffix }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <section class="shell block">
      <div class="note note-warning llc">
        <h2 class="llc-title">
          {{ t('about.llc.title') }}
        </h2>
        <p>{{ t('about.llc.p1') }}</p>
        <p>{{ t('about.llc.p2') }}</p>
        <p class="llc-emphasis">{{ t('about.llc.p3') }}</p>
      </div>
    </section>

    <section class="shell block">
      <h2 class="section-label">
        {{ t('about.team.title') }}
      </h2>

      <ul class="people">
        <li v-for="member in team" :key="member.name" class="person">
          <img
            :src="member.avatar"
            :alt="member.name"
            class="person-avatar"
            width="56"
            height="56"
            loading="lazy"
          >

          <div class="person-body">
            <p class="person-name">
              {{ member.name }}
            </p>
            <p class="person-role">
              {{ member.role }}
            </p>
            <p class="person-bio">
              {{ member.bio }}
            </p>

            <p class="person-links">
              <a
                v-if="member.profileUrl"
                :href="member.profileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="person-link link-quiet"
              >
                {{ t('about.team.profile') }}
                <ArrowUpRight class="person-link-icon" aria-hidden="true" />
              </a>
              <a
                v-if="member.github"
                :href="member.github"
                target="_blank"
                rel="noopener noreferrer"
                class="person-link link-quiet"
              >
                GitHub
                <ArrowUpRight class="person-link-icon" aria-hidden="true" />
              </a>
            </p>
          </div>
        </li>

        <li class="person">
          <span class="person-avatar person-avatar-empty" aria-hidden="true">?</span>

          <div class="person-body">
            <p class="person-name">
              {{ t('about.hiring.title') }}
            </p>
            <p class="person-role">
              {{ t('about.hiring.subtitle') }}
            </p>
            <p class="person-bio">
              {{ t('about.hiring.roles') }}
            </p>
            <p class="person-bio person-note">
              {{ t('about.hiring.note') }}
            </p>
            <p class="person-hire">
              {{ t('about.hiring.cta') }}
              <a href="mailto:lily@solsynth.dev" class="link-quiet">{{ t('about.hiring.email') }}</a>
            </p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.about {
  padding-bottom: 4rem;
}

.masthead {
  padding-block: 3.5rem 2.5rem;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.back:hover,
.back:focus-visible {
  color: var(--color-base-content);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.masthead-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.masthead-lede {
  margin: 0.75rem 0 0;
}

.block {
  padding-block: 2rem;
}

.split {
  display: grid;
  gap: 2rem;
  margin-top: 1.25rem;
}

.mission {
  font-size: 0.9375rem;
  line-height: 1.75;
  color: var(--color-dim);
}

.mission p {
  margin: 0;
}

.mission p + p {
  margin-top: 1rem;
}

.aside-title {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.aside-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.6rem;
  max-width: 30rem;
}

.aside-item {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.aside-dot {
  margin-top: 0.46rem;
  background: var(--color-line);
}

.values {
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.value-row {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  gap: 0.35rem 0.9rem;
  padding-block: 1rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.value-icon {
  width: 1rem;
  height: 1rem;
  margin-top: 0.2rem;
  color: var(--color-faint);
}

.value-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.value-desc {
  grid-column: 2;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.readout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1.5rem;
  margin: 0;
}

.readout-cell {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.readout-label {
  order: 2;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.readout-figure {
  order: 1;
  display: flex;
  align-items: baseline;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1;
  color: var(--color-base-content);
  font-variant-numeric: tabular-nums;
}

.readout-suffix {
  color: var(--color-dim);
}

.llc {
  display: grid;
  gap: 0.5rem;
  max-width: 34rem;
  padding: 1rem 1.125rem;
}

.llc-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-warning);
}

.llc p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.llc-emphasis {
  color: var(--color-base-content);
  font-weight: 600;
}

.people {
  margin: 1.75rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 2rem;
}

.person {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.person-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  object-fit: cover;
  background: var(--color-base-300);
}

.person-avatar-empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.125rem;
  color: var(--color-faint);
}

.person-body {
  min-width: 0;
}

.person-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-base-content);
  letter-spacing: -0.01em;
}

.person-role {
  margin: 0.15rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.person-bio {
  margin: 0.65rem 0 0;
  max-width: 34rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-dim);
}

.person-note {
  margin-top: 0.35rem;
  color: var(--color-faint);
}

.person-hire {
  margin: 0.65rem 0 0;
  max-width: 34rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-dim);
}

.person-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.15rem;
  margin: 0.75rem 0 0;
}

.person-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.person-link-icon {
  width: 0.75rem;
  height: 0.75rem;
}

@media (min-width: 768px) {
  .value-row {
    grid-template-columns: 1.25rem minmax(0, 15rem) minmax(0, 1fr);
    align-items: baseline;
    padding-block: 0.95rem;
  }

  .value-desc {
    grid-column: 3;
  }

  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }

  .readout-cell {
    padding-inline: 1.5rem;
    border-left: 1px solid var(--color-line-soft);
  }

  .readout-cell:first-child {
    padding-left: 0;
    border-left: 0;
  }
}

@media (min-width: 1024px) {
  .split {
    grid-template-columns: minmax(0, 34rem) minmax(0, 1fr);
    gap: 4rem;
  }

  .block {
    padding-block: 2.5rem;
  }
}
</style>
