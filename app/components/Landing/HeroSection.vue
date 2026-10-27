<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="hero" :aria-label="t('home.hero.title')">
    <div class="hero-grid">
      <div class="hero-copy">
        <h1 class="display hero-title">
          {{ t('home.hero.title') }}
        </h1>
        <p class="hero-sub">
          {{ t('home.hero.subtitle') }}
        </p>
        <div class="hero-actions">
          <NuxtLink :to="localePath('/products')" class="btn btn-primary hero-cta">
            {{ t('nav.products') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/about')" class="hero-quiet">
            {{ t('nav.about') }}
          </NuxtLink>
        </div>
      </div>

      <!-- The photograph is the page's one loud gesture, and type never sits
           on it: beside the copy on wide screens, below it on a phone. -->
      <div class="hero-media" aria-hidden="true">
        <NuxtImg
          src="/images/hero/background.webp"
          class="hero-photo"
          width="1600"
          height="900"
          loading="eager"
          fetchpriority="high"
          format="webp"
          alt=""
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The gutter matches `.shell`, so the headline lands on the same vertical
   line as every section below it. */
.hero {
  --hero-gutter: 1.25rem;

  margin-top: calc(-1 * var(--site-page-offset));
  padding-top: var(--site-page-offset);
  border-bottom: 1px solid var(--color-line-soft);
}

.hero-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-inline: var(--hero-gutter);
  padding-bottom: 2.5rem;
}

.hero-copy {
  max-width: 34rem;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.5rem, 8vw, 4rem);
  white-space: pre-line;
}

.hero-sub {
  margin: 1.125rem 0 0;
  max-width: 24rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  margin-top: 2rem;
}

.hero-cta {
  padding-inline: 1.5rem;
}

.hero-quiet {
  padding-bottom: 1px;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-dim);
  text-decoration: none;
  transition:
    color 140ms ease,
    border-color 140ms ease;
}

.hero-quiet:hover,
.hero-quiet:focus-visible {
  color: var(--color-base-content);
  border-color: var(--color-primary);
}

.hero-media {
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--color-base-200);
}

.hero-photo {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: 62% center;
}

@media (min-width: 640px) {
  .hero {
    --hero-gutter: 1.75rem;
  }
}

/* Wide: the copy keeps the page gutter — the same left edge as every section
   below — and the photograph runs off the right edge of the viewport. Nothing
   is layered on the picture, so both keep full contrast in either theme. */
@media (min-width: 1024px) {
  .hero {
    --hero-gutter: max(2.25rem, calc((100vw - 72rem) / 2 + 2.25rem));

    padding-top: calc(var(--site-page-offset) + 3.5rem);
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 26rem) minmax(0, 1fr);
    align-items: center;
    gap: 3.5rem;
    padding-bottom: 3.5rem;
  }

  .hero-media {
    margin-right: calc(-1 * var(--hero-gutter));
    border-radius: var(--radius-card) 0 0 var(--radius-card);
  }

  .hero-photo {
    aspect-ratio: 16 / 9;
    object-position: center;
  }
}
</style>
