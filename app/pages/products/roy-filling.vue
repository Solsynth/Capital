<script setup lang="ts">
import { BadgeCheck, Bug, FileText, Mail, Plus, Shield, User } from "@lucide/vue";

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

const steps = [
  {
    icon: FileText,
    n: "01",
    titleKey: "royIcpFilling.howToApply.step1.title",
    descKey: "royIcpFilling.howToApply.step1.desc",
  },
  {
    icon: Shield,
    n: "02",
    titleKey: "royIcpFilling.howToApply.step2.title",
    descKey: "royIcpFilling.howToApply.step2.desc",
  },
  {
    icon: BadgeCheck,
    n: "03",
    titleKey: "royIcpFilling.howToApply.step3.title",
    descKey: "royIcpFilling.howToApply.step3.desc",
  },
] as const;
</script>

<template>
  <div class="roy-filling-page">
    <!-- Hero -->
    <section
      class="relative min-h-[60vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/republic-of-yang/greatwall.webp"
        class="absolute inset-0 w-full h-full object-cover object-center -z-10 opacity-60"
        width="1920"
        height="1280"
        loading="eager"
        fetchpriority="high"
        format="webp"
        style="view-transition-name: product-hero-roy-filling"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/40 to-transparent dark:via-base-100/50"
      />

      <div class="relative container mx-auto px-4 pb-14 pt-44">
        <div class="hero-rise max-w-2xl">
          <NuxtImg
            src="/images/republic-of-yang/filling.png"
            class="w-14 h-14 rounded-2xl shadow-lg mb-5"
            alt="ROY ICP Filling"
            width="56"
            height="56"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <p class="eyebrow mb-3">Republic of Yang</p>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            {{ t("royIcpFilling.title") }}
          </h1>
          <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed max-w-xl">
            {{ t("royIcpFilling.tagline") }}
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="https://solsynth.dev/icp"
              target="_blank"
              class="btn btn-primary btn-md rounded-full px-6 gap-2"
            >
              <FileText class="w-4 h-4" />
              {{ t("royIcpFilling.applyNow") }}
            </a>
            <NuxtLink
              :to="localePath('/icp/submissions/me')"
              class="btn btn-ghost rounded-full px-5 gap-2"
            >
              {{ t("royIcpFilling.cta.submissions") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-2xl border-t border-base-content/10 pt-8">
        <p class="text-lg leading-relaxed opacity-70">
          {{ t("royIcpFilling.about.desc") }}
        </p>
      </div>
    </section>

    <!-- How it works -->
    <section id="apply" class="container mx-auto px-4 pb-24 scroll-mt-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("royIcpFilling.howToApply.title") }}</p>
      </div>

      <ol class="mt-12 grid md:grid-cols-3 gap-x-10 gap-y-10">
        <li
          v-for="step in steps"
          :key="step.n"
          class="border-t border-base-content/10 pt-6"
        >
          <span class="font-mono text-sm text-primary tabular-nums">{{ step.n }}</span>
          <component :is="step.icon" class="w-5 h-5 text-primary mt-3 mb-3" aria-hidden="true" />
          <h3 class="font-semibold">{{ t(step.titleKey) }}</h3>
          <p class="mt-1.5 text-sm opacity-60 leading-relaxed">
            {{ t(step.descKey) }}
          </p>
        </li>
      </ol>
    </section>

    <!-- CTA -->
    <section class="container mx-auto px-4 pb-16">
      <div
        class="border-t border-base-content/10 pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div class="max-w-xl">
          <h2 class="text-2xl font-semibold tracking-tight">
            {{ t("royIcpFilling.cta.apply") }}
          </h2>
          <p class="mt-1.5 text-xs opacity-30 max-w-xl leading-relaxed">
            {{ t("royIcpFilling.disclaimer") }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <NuxtLink
            :to="localePath('/icp/submit')"
            class="btn btn-primary rounded-full gap-2"
          >
            <Plus class="w-4 h-4" />
            {{ t("royIcpFilling.cta.apply") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/icp/identities')"
            class="btn btn-outline rounded-full gap-2"
          >
            <User class="w-4 h-4" />
            {{ t("royIcpFilling.cta.identities") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer links -->
    <section class="container mx-auto px-4 pb-16">
      <div class="flex flex-wrap gap-x-8 gap-y-3 text-sm opacity-50 border-t border-base-content/10 pt-8">
        <a
          href="https://github.com/Solsynth/Solian/issues"
          target="_blank"
          class="hover:opacity-100 transition-opacity inline-flex items-center gap-1.5"
        >
          <Bug class="w-4 h-4" />
          {{ t("royIcpFilling.help.reportIssue") }}
        </a>
        <a
          href="mailto:lily@solsynth.dev"
          class="hover:opacity-100 transition-opacity inline-flex items-center gap-1.5"
        >
          <Mail class="w-4 h-4" />
          {{ t("royIcpFilling.help.contact") }}
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.roy-filling-page {
  --color-primary: oklch(52% 0.09 35deg);
  --color-primary-content: oklch(97% 0.02 35deg);
}

::global([data-theme="dark"]) .roy-filling-page {
  --color-primary: oklch(72% 0.1 40deg);
  --color-primary-content: oklch(17% 0.03 35deg);
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.5;
}

/* One orchestrated moment: hero content rises on load */
.hero-rise > * {
  animation: hero-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-rise > *:nth-child(2) {
  animation-delay: 0.06s;
}
.hero-rise > *:nth-child(3) {
  animation-delay: 0.12s;
}
.hero-rise > *:nth-child(4) {
  animation-delay: 0.18s;
}
.hero-rise > *:nth-child(5) {
  animation-delay: 0.24s;
}
.hero-rise > *:nth-child(6) {
  animation-delay: 0.3s;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
