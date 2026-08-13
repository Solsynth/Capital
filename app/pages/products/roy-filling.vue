<script setup lang="ts">
import {
  Shield,
  FileText,
  Bug,
  Mail,
  BadgeCheck,
  User,
  Plus,
} from "@lucide/vue";

const localePath = useLocalePath();

const { t } = useI18n();

definePageMeta({
  title: "ROY ICP Filling",
  description: "",
});

useSeoMeta({
  description: () => t("royIcpFilling.tagline"),
  ogImage: "/images/republic-of-yang/filling.png",
  twitterCard: "summary_large_image",
  twitterImage: "/images/republic-of-yang/filling.png",
});

defineOgImage("UniOgImage", {
  title: () => t("royIcpFilling.title"),
  description: () => t("royIcpFilling.tagline"),
  iconImage: "/images/republic-of-yang/filling.png",
  backgroundImage: "/images/republic-of-yang/greatwall-og.png",
});
</script>

<template>
  <div class="roy-filling-page">
    <!-- Hero -->
    <section
      class="relative h-[60vh] min-h-100 overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/republic-of-yang/greatwall.webp"
        class="absolute inset-0 w-full h-full object-cover object-center -z-10 opacity-60"
        width="1920"
        height="1280"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-transparent to-base-100"
      ></div>

      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="container mx-auto text-center">
          <NuxtImg
            src="/images/republic-of-yang/filling.png"
            class="w-20 h-20 rounded-2xl shadow-2xl mx-auto mb-4"
            alt="ROY ICP Filling"
            width="80"
            height="80"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <h1 class="text-4xl md:text-5xl font-bold mb-3">
            {{ t("royIcpFilling.title") }}
          </h1>
          <p class="text-lg opacity-70 max-w-xl mx-auto mb-6">
            {{ t("royIcpFilling.tagline") }}
          </p>
          <a
            href="https://solsynth.dev/icp"
            target="_blank"
            class="btn btn-primary rounded-full"
          >
            <FileText class="w-4 h-4" />
            {{ t("royIcpFilling.applyNow") }}
          </a>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="container mx-auto px-4 py-20 max-w-3xl">
      <p class="text-lg leading-relaxed opacity-80 text-center">
        {{ t("royIcpFilling.about.desc") }}
      </p>
    </section>

    <!-- How it works -->
    <section class="bg-base-200">
      <div class="container mx-auto px-4 py-20 max-w-4xl">
        <h2 class="text-2xl font-bold text-center mb-12">
          {{ t("royIcpFilling.howToApply.title") }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
            >
              <FileText class="w-5 h-5 text-primary" />
            </div>
            <h3 class="font-semibold mb-1">
              {{ t("royIcpFilling.howToApply.step1.title") }}
            </h3>
            <p class="text-sm opacity-60">
              {{ t("royIcpFilling.howToApply.step1.desc") }}
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
            >
              <Shield class="w-5 h-5 text-primary" />
            </div>
            <h3 class="font-semibold mb-1">
              {{ t("royIcpFilling.howToApply.step2.title") }}
            </h3>
            <p class="text-sm opacity-60">
              {{ t("royIcpFilling.howToApply.step2.desc") }}
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
            >
              <BadgeCheck class="w-5 h-5 text-primary" />
            </div>
            <h3 class="font-semibold mb-1">
              {{ t("royIcpFilling.howToApply.step3.title") }}
            </h3>
            <p class="text-sm opacity-60">
              {{ t("royIcpFilling.howToApply.step3.desc") }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section
      class="container mx-auto px-4 py-20 text-center flex gap-3 justify-center"
    >
      <NuxtLink
        :to="localePath('/icp/submit')"
        class="btn btn-primary rounded-full"
      >
        <Plus class="w-4 h-4 mr-1" />
        {{ t("royIcpFilling.cta.apply") }}
      </NuxtLink>
      <NuxtLink
        :to="localePath('/icp/submissions/me')"
        class="btn btn-outline rounded-full"
      >
        {{ t("royIcpFilling.cta.submissions") }}
      </NuxtLink>
      <NuxtLink
        :to="localePath('/icp/identities')"
        class="btn btn-outline rounded-full"
      >
        <User class="w-4 h-4 mr-1" />
        {{ t("royIcpFilling.cta.identities") }}
      </NuxtLink>
    </section>

    <!-- Footer links -->
    <section class="container mx-auto px-4 pb-16 text-center">
      <div class="flex justify-center gap-6 text-sm opacity-50">
        <a
          href="https://github.com/Solsynth/Solian/issues"
          target="_blank"
          class="hover:opacity-100 transition-opacity"
        >
          <Bug class="w-4 h-4 inline mr-1" />
          {{ t("royIcpFilling.help.reportIssue") }}
        </a>
        <a
          href="mailto:lily@solsynth.dev"
          class="hover:opacity-100 transition-opacity"
        >
          <Mail class="w-4 h-4 inline mr-1" />
          {{ t("royIcpFilling.help.contact") }}
        </a>
      </div>
      <p class="text-xs opacity-30 mt-6 max-w-xl mx-auto">
        {{ t("royIcpFilling.disclaimer") }}
      </p>
    </section>
  </div>
</template>
