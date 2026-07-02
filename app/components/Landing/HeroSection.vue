<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <section
    class="min-h-[80vh] flex flex-col items-start justify-center text-left relative px-4 -mt-(--site-page-offset,64px)"
  >
    <NuxtImg
      src="/images/hero/background.webp"
      class="absolute inset-0 w-full h-full object-cover object-top-bottom -z-10 opacity-40"
      loading="eager"
      format="webp"
      alt=""
    />
    <NuxtImg
      src="/images/hero/background.webp"
      class="absolute inset-0 w-full h-full object-cover object-top-bottom -z-10 opacity-40 blur-md mask-[linear-gradient(to_right,black_30%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_right,black_30%,transparent_70%)]"
      loading="eager"
      format="webp"
      alt=""
    />
    <div class="container mx-auto">
      <div
        class="text-4xl md:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight hero-glow"
      >
        <pre class="font-sans">{{ t("home.hero.title") }}</pre>
      </div>

      <p class="text-lg md:text-xl lg:text-2xl mx-auto mb-10 hero-glow">
        {{ t("home.hero.subtitle") }}
      </p>

      <div class="flex gap-3 flex-wrap justify-start">
        <NuxtLink
          :to="localePath('/products')"
          class="btn btn-primary btn-lg rounded-lg px-6 md:px-8 text-lg font-bold shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.7)]"
        >
          {{ t("nav.products") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/about')"
          class="btn btn-lg rounded-lg px-6 md:px-8 text-lg shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
        >
          {{ t("nav.about") }}
        </NuxtLink>
      </div>
    </div>

    <div class="absolute bottom-10 opacity-40 left-0 right-0">
      <svg
        class="w-6 h-6 mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.hero-glow {
  color: white;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 30px rgba(255, 255, 255, 0.4),
    0 0 60px rgba(99, 102, 241, 0.3);
}

.text-rotate {
  display: inline-block;
  position: relative;
  height: 1.2em;
  vertical-align: bottom;
}

.text-rotate > span {
  position: absolute;
  left: 0;
  top: 0;
  white-space: nowrap;
  animation: word-fade 12s ease-in-out infinite;
  opacity: 0;
}

@keyframes word-fade {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  4% {
    opacity: 1;
    transform: translateY(0);
  }
  22% {
    opacity: 1;
    transform: translateY(0);
  }
  26% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
