<script setup lang="ts">
interface Props {
  lang?: string
}

const props = withDefaults(defineProps<Props>(), { lang: 'en' })

const isZh = computed(() => props.lang === 'zh')

const stats = computed(() =>
  isZh.value
    ? [
        { value: 2, suffix: '+', label: '年' },
        { value: 3, suffix: '+', label: '款产品' },
        { value: 1, suffix: 'K+', label: '用户' },
        { value: 100, suffix: '%', label: '热爱' },
      ]
    : [
        { value: 2, suffix: '+', label: 'Years' },
        { value: 3, suffix: '+', label: 'Products' },
        { value: 1, suffix: 'K+', label: 'Users' },
        { value: 100, suffix: '%', label: 'Passion' },
      ],
)
</script>

<template>
  <section class="py-16 px-4 bg-base-200/30">
    <div class="container mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="text-center animate-fade-in-up"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            <span class="counter" :data-target="stat.value">0</span>{{ stat.suffix }}
          </div>
          <div class="text-lg opacity-70">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script lang="ts">
if (import.meta.client) {
  const animateCounter = (el: Element) => {
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })

  document.querySelectorAll('.counter').forEach(counter => observer.observe(counter))
}
</script>
