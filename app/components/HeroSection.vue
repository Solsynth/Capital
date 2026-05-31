<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

interface Props {
  lang?: string
}

const props = withDefaults(defineProps<Props>(), { lang: 'en' })

const isZh = computed(() => props.lang === 'zh')

const strings = computed(() =>
  isZh.value
    ? ['制作软件', '制作硬件', '创造体验', '书写故事']
    : ['make software', 'make hardware', 'craft experiences', 'write stories'],
)

const subtitle = computed(() =>
  isZh.value
    ? '我们是一群志同道合的朋友，致力于打造软件、硬件和一切有趣的事物。'
    : 'We are a group of friends that make software, hardware and any stuff that is interesting.',
)
</script>

<template>
  <section class="min-h-[80vh] flex flex-col items-center justify-center text-center relative px-4">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[60px] -z-10 pointer-events-none max-md:w-[300px] max-md:h-[300px] will-change-transform" />

    <div class="container mx-auto max-w-4xl">
      <img
        src="/favicon.png"
        class="w-24 md:w-32 mb-8 animate-float mx-auto will-change-transform"
        alt="Solsynth"
      >

      <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
        <span>{{ isZh ? '我们' : 'We' }} </span>
        <span class="text-rotate text-primary">
          <span>
            <span v-for="s in strings" :key="s">{{ s }}</span>
          </span>
        </span>
      </h1>

      <p class="text-lg md:text-xl lg:text-2xl opacity-80 max-w-2xl mx-auto mb-10">
        {{ subtitle }}
      </p>

      <div class="flex gap-4 flex-wrap justify-center">
        <NuxtLink
          :to="localePath('/products')"
          class="btn btn-primary btn-lg rounded-full px-6 md:px-8 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
        >
          {{ t('nav.products') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/about')"
          class="btn btn-lg rounded-full px-6 md:px-8 text-lg"
        >
          {{ t('nav.about') }}
        </NuxtLink>
      </div>
    </div>

    <div class="absolute bottom-10 animate-bounce">
      <svg class="w-8 h-8 opacity-50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.text-rotate {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}

.text-rotate > span {
  display: inline-flex;
  flex-direction: column;
  animation: word-cycle 16s linear infinite;
}

.text-rotate > span > span {
  height: 1.2em;
  line-height: 1.2em;
}

@keyframes word-cycle {
  0%,
  3% {
    transform: translateY(0);
    opacity: 1;
  }
  6%,
  22% {
    transform: translateY(-100%);
    opacity: 0;
  }
  25% {
    transform: translateY(100%);
    opacity: 0;
  }
  28%,
  97% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
