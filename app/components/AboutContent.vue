<script setup lang="ts">
import {
  Heart,
  Code,
  Users,
  Sparkles,
  CodeXml,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const team = computed(() => [
  {
    name: 'LittleSheep',
    role: t('about.team.role.founder'),
    avatar: 'https://api.solian.app/passport/accounts/littlesheep/picture',
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

const stats = computed(() => [
  { value: 2, suffix: '+', label: t('about.stats.years') },
  { value: 3, suffix: '+', label: t('about.stats.products') },
  { value: 1, suffix: 'K+', label: t('about.stats.users') },
  { value: 100, suffix: '%', label: t('about.stats.passion') },
])

const counterRefs = ref<HTMLElement[]>([])

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counterRefs.value.forEach((el) => {
      el.textContent = el.getAttribute('data-target') || '0'
    })
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 },
  )

  counterRefs.value.forEach(el => observer.observe(el))
})

function animateCounter(el: HTMLElement) {
  const target = Number.parseInt(el.getAttribute('data-target') || '0', 10)
  const duration = 1200
  const start = performance.now()

  const update = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - (1 - progress) ** 3
    el.textContent = Math.floor(eased * target).toString()
    if (progress < 1)
      requestAnimationFrame(update)
    else
      el.textContent = target.toString()
  }

  requestAnimationFrame(update)
}
</script>

<template>
  <div>
    <!-- Header -->
    <section class="border-b border-base-200 px-4 py-16 md:py-20">
      <div class="container mx-auto max-w-3xl">
        <NuxtLink
          :to="localePath('/')"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('about.backToHome') }}
        </NuxtLink>

        <h1 class="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          {{ t('about.title') }}
        </h1>
        <p class="max-w-xl text-lg text-base-content/65 md:text-xl">
          {{ t('about.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Mission -->
    <section class="px-4 py-14">
      <div class="container mx-auto max-w-3xl">
        <h2 class="mb-4 text-2xl font-bold tracking-tight">
          {{ t('about.mission.title') }}
        </h2>
        <div class="space-y-4 text-base leading-relaxed text-base-content/80 md:text-lg">
          <p>{{ t('about.mission.p1') }}</p>
          <p>{{ t('about.mission.p2') }}</p>
        </div>
      </div>
    </section>

    <!-- Did you know -->
    <section class="px-4 pb-14">
      <div class="container mx-auto max-w-3xl">
        <div class="rounded-lg border border-base-200 bg-base-200/40 p-5 md:p-6">
          <h2 class="mb-3 flex items-center gap-2 text-base font-semibold">
            <Sparkles class="h-4 w-4 text-base-content/50" />
            {{ t('about.didYouKnow.title') }}
          </h2>
          <ul class="space-y-2 text-sm text-base-content/70">
            <li class="flex items-start gap-2">
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-base-content/40" />
              <span>{{ t('about.didYouKnow.solsynth') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-base-content/40" />
              <span>{{ t('about.didYouKnow.chinese') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="border-y border-base-200 bg-base-200/30 px-4 py-14">
      <div class="container mx-auto max-w-5xl">
        <h2 class="mb-8 text-center text-2xl font-bold tracking-tight">
          {{ t('about.values.title') }}
        </h2>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="value in values"
            :key="value.key"
            class="rounded-lg border border-base-200 bg-base-100 p-5"
          >
            <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-base-200 bg-base-200/60">
              <component :is="value.icon" class="h-4 w-4 text-base-content/70" />
            </div>
            <h3 class="mb-1.5 text-base font-semibold">
              {{ t(`about.values.${value.key}.title`) }}
            </h3>
            <p class="text-sm leading-relaxed text-base-content/55">
              {{ t(`about.values.${value.key}.desc`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="border-b border-base-200 px-4 py-10">
      <div class="container mx-auto max-w-3xl">
        <div class="grid grid-cols-2 divide-base-300 md:grid-cols-4 md:divide-x">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="px-4 py-4 text-center md:py-2"
            :class="index % 2 === 1 ? 'max-md:border-l max-md:border-base-300' : ''"
          >
            <div class="text-3xl font-extrabold tracking-tight tabular-nums md:text-4xl">
              <span
                ref="counterRefs"
                class="counter"
                :data-target="stat.value"
              >0</span>{{ stat.suffix }}
            </div>
            <div class="mt-1 text-sm text-base-content/55">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- LLC note -->
    <section class="px-4 py-12">
      <div class="container mx-auto max-w-3xl">
        <div class="flex gap-3 rounded-lg border border-warning/25 bg-warning/5 p-4 md:p-5">
          <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div class="min-w-0">
            <h3 class="mb-1.5 font-semibold">
              {{ t('about.llc.title') }}
            </h3>
            <div class="space-y-1.5 text-sm leading-relaxed text-base-content/75">
              <p>{{ t('about.llc.p1') }}</p>
              <p>{{ t('about.llc.p2') }}</p>
              <p class="font-medium text-base-content/90">
                {{ t('about.llc.p3') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="border-t border-base-200 bg-base-200/30 px-4 py-14">
      <div class="container mx-auto max-w-5xl">
        <h2 class="mb-8 text-center text-2xl font-bold tracking-tight">
          {{ t('about.team.title') }}
        </h2>

        <div class="mx-auto flex max-w-3xl flex-col gap-5 sm:flex-row sm:flex-wrap sm:justify-center">
          <div
            v-for="member in team"
            :key="member.name"
            class="flex w-full max-w-sm flex-col rounded-lg border border-base-200 bg-base-100 p-6 sm:w-[calc(50%-0.625rem)]"
          >
            <div class="mb-4 flex items-center gap-3">
              <img
                :src="member.avatar"
                :alt="member.name"
                class="h-14 w-14 rounded-full object-cover"
                loading="lazy"
              >
              <div class="min-w-0">
                <h3 class="truncate text-lg font-bold">
                  {{ member.name }}
                </h3>
                <span class="badge badge-sm badge-ghost mt-0.5">{{ member.role }}</span>
              </div>
            </div>

            <p class="mb-5 flex-1 text-sm leading-relaxed text-base-content/65">
              {{ member.bio }}
            </p>

            <div class="flex flex-wrap gap-2">
              <a
                v-if="member.profileUrl"
                :href="member.profileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm gap-1.5 border border-base-300"
              >
                <ExternalLink class="h-3.5 w-3.5" />
                {{ t('about.team.profile') }}
              </a>
              <a
                v-if="member.github"
                :href="member.github"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm gap-1.5 border border-base-300"
              >
                <CodeXml class="h-3.5 w-3.5" />
                GitHub
              </a>
            </div>
          </div>

          <!-- Hiring -->
          <div class="flex w-full max-w-sm flex-col rounded-lg border border-dashed border-base-300 bg-base-100/60 p-6 sm:w-[calc(50%-0.625rem)]">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-14 w-14 items-center justify-center rounded-full border border-base-200 bg-base-200/60 text-xl font-semibold text-base-content/40">
                ?
              </div>
              <div>
                <h3 class="text-lg font-bold">
                  {{ t('about.hiring.title') }}
                </h3>
                <p class="text-sm text-base-content/55">
                  {{ t('about.hiring.subtitle') }}
                </p>
              </div>
            </div>

            <div class="mb-5 flex-1 space-y-2 text-sm leading-relaxed text-base-content/65">
              <p>{{ t('about.hiring.roles') }}</p>
              <p>{{ t('about.hiring.note') }}</p>
              <p>{{ t('about.hiring.cta') }}</p>
            </div>

            <a
              href="mailto:lily@solsynth.dev"
              class="btn btn-primary btn-sm self-start"
            >
              {{ t('about.hiring.email') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
