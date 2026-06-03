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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target as HTMLElement)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })

  counterRefs.value.forEach(el => observer.observe(el))
})

function animateCounter(el: HTMLElement) {
  const target = parseInt(el.getAttribute('data-target') || '0')
  const duration = 2000
  const step = target / (duration / 16)
  let current = 0

  const update = () => {
    current += step
    if (current < target) {
      el.textContent = Math.floor(current).toString()
      requestAnimationFrame(update)
    }
    else {
      el.textContent = target.toString()
    }
  }

  update()
}
</script>

<template>
  <section class="py-12 px-4 border-y border-base-200">
    <div class="container mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="text-center"
        >
          <div class="text-3xl md:text-4xl font-extrabold text-primary mb-1">
            <span ref="counterRefs" class="counter" :data-target="stat.value">0</span>{{ stat.suffix }}
          </div>
          <div class="text-sm opacity-60">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
