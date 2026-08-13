<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section
    class="relative flex min-h-[72vh] flex-col items-start justify-center px-4 py-24 text-left -mt-(--site-page-offset,64px)"
  >
    <NuxtImg
      src="/images/hero/background.webp"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-35"
      width="1600"
      height="900"
      loading="eager"
      fetchpriority="high"
      format="webp"
      alt=""
    />
    <!-- Soft edge so the photo dissolves into the page, not a hard crop -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-base-100/20 via-transparent to-base-100"
    />
    <div
      class="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full max-w-3xl bg-linear-to-r from-base-100/70 via-base-100/25 to-transparent"
    />

    <div class="container relative mx-auto">
      <h1
        class="mb-5 max-w-3xl whitespace-pre-line text-4xl font-extrabold tracking-tight text-base-content md:text-5xl lg:text-6xl"
      >
        {{ t('home.hero.title') }}
      </h1>

      <p class="mb-10 max-w-xl text-lg text-base-content/70 md:text-xl">
        {{ t('home.hero.subtitle') }}
      </p>

      <div class="flex flex-wrap gap-3">
        <NuxtLink
          :to="localePath('/products')"
          class="btn btn-primary btn-lg rounded-lg px-6 font-semibold md:px-8"
        >
          {{ t('nav.products') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/about')"
          class="btn btn-ghost btn-lg rounded-lg border border-base-300 px-6 md:px-8"
        >
          {{ t('nav.about') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
