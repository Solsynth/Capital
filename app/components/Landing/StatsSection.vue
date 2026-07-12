<script setup lang="ts">
const { t } = useI18n()

const stats = computed(() => [
  { value: 2, suffix: '+', label: t('home.stats.years') },
  { value: 3, suffix: '+', label: t('home.stats.products') },
  { value: 1, suffix: 'K+', label: t('home.stats.users') },
  { value: 100, suffix: '%', label: t('home.stats.passion') },
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
    // ease-out cubic
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
  <section class="border-y border-base-200 bg-base-200/40 px-4 py-10">
    <div class="container mx-auto">
      <div class="grid grid-cols-2 divide-base-300 md:grid-cols-4 md:divide-x">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="px-4 py-4 text-center md:py-2"
          :class="index % 2 === 1 ? 'max-md:border-l max-md:border-base-300' : ''"
        >
          <div class="text-3xl font-extrabold tracking-tight tabular-nums text-base-content md:text-4xl">
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
</template>
