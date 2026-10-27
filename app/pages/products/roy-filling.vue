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
  <div>
    <header class="masthead">
      <div class="masthead-media" aria-hidden="true">
        <NuxtImg
          src="/images/republic-of-yang/greatwall.webp"
          alt=""
          width="1920"
          height="1080"
          format="webp"
          loading="eager"
          fetchpriority="high"
          style="view-transition-name: product-hero-roy-filling"
        />
      </div>

      <div class="shell masthead-grid">
        <div class="masthead-copy">
          <div class="ident">
            <img
              src="/images/republic-of-yang/filling.png"
              class="ident-mark"
              alt=""
              width="56"
              height="56"
              loading="eager"
              decoding="async"
            >
            <span class="ident-series">Republic of Yang</span>
          </div>

          <h1 class="display masthead-title">
            {{ t('royIcpFilling.title') }}
          </h1>
          <p class="masthead-lede">
            {{ t('royIcpFilling.tagline') }}
          </p>

          <div class="masthead-actions">
            <a href="https://solsynth.dev/icp" target="_blank" rel="noopener" class="btn btn-primary action">
              <FileText class="action-icon" aria-hidden="true" />
              {{ t('royIcpFilling.applyNow') }}
            </a>
            <NuxtLink :to="localePath('/icp/submissions/me')" class="btn btn-ghost action">
              {{ t('royIcpFilling.cta.submissions') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <section class="band">
      <div class="shell">
        <p class="about-lede">
          {{ t('royIcpFilling.about.desc') }}
        </p>
      </div>
    </section>

    <!-- Genuinely a sequence: the filing process has an order. -->
    <section id="apply" class="band">
      <div class="shell">
        <h2 class="band-title">
          {{ t('royIcpFilling.howToApply.title') }}
        </h2>

        <ol class="steps">
          <li v-for="step in steps" :key="step.n" class="step">
            <span class="mono step-number">{{ step.n }}</span>
            <div class="step-body">
              <component :is="step.icon" class="step-icon" aria-hidden="true" />
              <h3 class="step-title">{{ t(step.titleKey) }}</h3>
              <p class="step-desc">{{ t(step.descKey) }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="band">
      <div class="shell">
        <div class="apply">
          <div class="apply-copy">
            <h2 class="apply-title">
              {{ t('royIcpFilling.cta.apply') }}
            </h2>
            <p class="apply-note">
              {{ t('royIcpFilling.disclaimer') }}
            </p>
          </div>
          <div class="apply-actions">
            <NuxtLink :to="localePath('/icp/submit')" class="btn btn-primary action">
              <Plus class="action-icon" aria-hidden="true" />
              {{ t('royIcpFilling.cta.apply') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/icp/identities')" class="btn btn-ghost action">
              <User class="action-icon" aria-hidden="true" />
              {{ t('royIcpFilling.cta.identities') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="shell help">
      <a href="https://github.com/Solsynth/Solian/issues" target="_blank" rel="noopener" class="help-link">
        <Bug class="help-icon" aria-hidden="true" />
        {{ t('royIcpFilling.help.reportIssue') }}
      </a>
      <a href="mailto:lily@solsynth.dev" class="help-link">
        <Mail class="help-icon" aria-hidden="true" />
        {{ t('royIcpFilling.help.contact') }}
      </a>
    </section>
  </div>
</template>

<style scoped>
.masthead {
  position: relative;
  overflow: hidden;
  margin-top: calc(-1 * var(--site-page-offset));
  padding-top: calc(var(--site-page-offset) + 5rem);
  padding-bottom: 4rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.masthead-media {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.masthead-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.55;
}

.masthead-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, var(--color-base-100) 12%, color-mix(in oklab, var(--color-base-100) 55%, transparent) 55%, transparent 92%),
    linear-gradient(to right, var(--color-base-100) 10%, color-mix(in oklab, var(--color-base-100) 55%, transparent) 60%, transparent 100%);
}

.masthead-grid {
  position: relative;
  z-index: 1;
}

.masthead-copy {
  max-width: 34rem;
}

.ident {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.ident-mark {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-mark);
  object-fit: cover;
  background: var(--color-base-300);
}

.ident-series {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dim);
}

.masthead-title {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
}

.masthead-lede {
  margin: 1rem 0 0;
  max-width: 32rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.masthead-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.75rem;
}

.action {
  padding-inline: 1.25rem;
}

.action-icon {
  width: 0.9375rem;
  height: 0.9375rem;
}

.band {
  padding-top: 3.5rem;
}

.about-lede {
  margin: 0;
  max-width: 34rem;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.band-title {
  margin: 0 0 1.5rem;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.steps {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  gap: 0.9rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-line);
}

.step-number {
  color: var(--color-primary);
  font-size: 0.75rem;
}

.step-body {
  min-width: 0;
}

.step-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  color: var(--color-primary);
}

.step-title {
  margin: 0.6rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.step-desc {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.apply {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-line);
}

.apply-copy {
  max-width: 30rem;
}

.apply-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.apply-note {
  margin: 0.6rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.apply-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.help {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding-top: 2.5rem;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.help-link:hover,
.help-link:focus-visible {
  color: var(--color-base-content);
}

.help-icon {
  width: 0.875rem;
  height: 0.875rem;
}

@media (min-width: 768px) {
  .steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2.5rem;
  }
}
</style>
