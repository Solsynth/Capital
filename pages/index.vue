<template>
  <v-container class="flex flex-col my-2 px-12 gap-[4rem]">
    <section class="content-section flex flex-col items-center justify-center text-center px-4">
      <img
        v-motion="{
          initial: {
            y: 100,
            opacity: 0,
          },
          enter: {
            y: 0,
            opacity: 1,
          },
        }"
        :src="Logo"
        alt="Company Logo"
        class="w-32 h-32 mb-4"
      />
      <h1 class="text-4xl font-bold">Welcome to {{ t("brandName") }}</h1>
      <p class="mt-2 text-lg">Building cool, open-source, and elegant apps for human.</p>
      <v-btn class="mt-4" color="primary" prepend-icon="mdi-arrow-down" href="#products">{{ t("learnMore") }}</v-btn>
    </section>

    <section class="content-section py-16" id="products">
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold">Our Projects</h2>
        <p>Take a peek of our works.</p>
        <v-card class="mt-12">
          <product-carousel class="carousel-section" :products="products as any[]" />
        </v-card>
      </div>
    </section>

    <v-row class="content-section">
      <v-col cols="12" md="6">
        <v-card>
          <v-list>
            <v-list-item
              title="GitHub"
              subtitle="The place hosts most of our public projects' code"
              prepend-icon="mdi-github"
              href="https://github.com/Solsynth"
              target="_blank"
            />
            <v-list-item
              lines="two"
              title="Solsynth Code Repository"
              subtitle="Our self-hosted git server, may contains some unpublished projects' code"
              prepend-icon="mdi-git"
              href="https://git.solsynth.dev/explore"
              target="_blank"
            />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="flex justify-end" order="first" order-md="last">
        <div class="text-right flex flex-col items-end">
          <h2 class="text-4xl font-bold">
            We<br />
            ❤️ Open-source
          </h2>
          <p class="text-md mt-3 max-w-2/3">
            No software can run without the support of open source software, and our software is no exception.
            Therefore, we feel it is important to contribute to open source as well.
          </p>
          <p class="text-grey mt-2">
            <v-icon icon="mdi-arrow-left" size="16" class="mb-0.5" />
            Check out our GitHub
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import Logo from "../assets/logo-w-shadow.png"

import { getLocale } from "~/utils/locale"

const { t } = useI18n()

useHead({
  title: t("brandName"),
})

useSeoMeta({
  title: t("brandName"),
  description: t("indexIntroduce"),
  ogTitle: t("brandName"),
  ogDescription: t("indexIntroduce"),
  ogUrl: useRuntimeConfig().public.siteUrl,
  ogType: "website",
  ogSiteName: "Solsynth Capital",
})

const { data: products } = await useAsyncData("products", () => {
  return queryContent("/products")
    .where({ _locale: getLocale(), archived: { $ne: true } })
    .limit(5)
    .find()
})
</script>

<style scoped>
.carousel-section {
  height: 120rem;
}

.content-section {
  min-height: calc(100vh - 80px);
  display: flex;
  place-items: center;
}
</style>

<style>
body,
html {
  scroll-behavior: smooth;
}
</style>
