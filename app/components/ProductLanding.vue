<script setup lang="ts">
import { Bug, CodeXml } from '@lucide/vue'
import type { Component } from 'vue'
import ProductDownloadsCta from '~/components/ProductDownloadsCta.vue'
import ReviewSummary from '~/components/ReviewSummary.vue'
import ReviewForm from '~/components/ReviewForm.vue'
import ReviewList from '~/components/ReviewList.vue'
import { useProductReviews } from '~/composables/useProductReviews'
import { useProductReviewSubmission } from '~/composables/useProductReviewSubmission'

interface Card {
  icon: Component
  title: string
  desc: string
}

interface Props {
  slug: string
  title: string
  tagline: string
  icon: string
  background: string
  /** Short facts printed above the title, separated by the layout. */
  badges?: string[]
  /** A command or address that identifies the product; printed in mono. */
  prompt?: string
  /** Where "Get started" goes; external links use `href`. */
  primaryLabel?: string
  href?: string
  to?: string
  repo?: string
  aboutTitle?: string
  aboutDesc?: string
  aboutCards?: Card[]
  featuresTitle?: string
  featuresDesc?: string
  features?: Card[]
  /** Show the reviews panel; pages without an API-backed product hide it. */
  reviews?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  badges: () => [],
  primaryLabel: '',
  aboutCards: () => [],
  features: () => [],
  reviews: true,
})

const { t } = useI18n()

// ==================== Reviews ====================
const {
  reviews: reviewItems,
  summary,
  loading: reviewsLoading,
  sort,
  setSort,
  page,
  totalPages,
  nextPage,
  prevPage,
  refresh: refreshReviews,
} = useProductReviews(props.slug)

const {
  myReview,
  loading: myReviewLoading,
  submitting,
  fetchMyReview,
  submit,
  update,
  remove,
} = useProductReviewSubmission(props.slug)

const reviewFormOpen = ref(false)
const reviewForm = ref({ rating: 0, title: '', content: '', isRecommended: null as boolean | null })

onMounted(async () => {
  if (!props.reviews) return
  await Promise.all([fetchMyReview(), refreshReviews()])
})

function openReviewForm() {
  reviewForm.value = myReview.value
    ? {
        rating: myReview.value.rating,
        title: myReview.value.title || '',
        content: myReview.value.content || '',
        isRecommended: myReview.value.isRecommended,
      }
    : { rating: 0, title: '', content: '', isRecommended: null }
  reviewFormOpen.value = true
}

async function handleSubmitReview() {
  if (reviewForm.value.rating === 0) return
  try {
    if (myReview.value) await update(reviewForm.value)
    else await submit(reviewForm.value)
    reviewFormOpen.value = false
    await refreshReviews()
  } catch {
    // the composable records the error
  }
}

async function handleDeleteReview() {
  try {
    await remove()
    reviewFormOpen.value = false
    await refreshReviews()
  } catch {
    // the composable records the error
  }
}

async function handleHelpful(id: string) {
  await $fetch(`/api/products/${props.slug}/reviews/${id}/helpful`, { method: 'POST' })
  await refreshReviews()
}
</script>

<template>
  <div>
    <header class="masthead">
      <div class="shell masthead-grid">
        <div class="masthead-copy">
          <div class="ident">
            <NuxtImg
              :src="icon"
              class="ident-mark"
              :alt="''"
              width="56"
              height="56"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <span v-if="badges.length" class="ident-badges">
              <span v-for="(badge, index) in badges" :key="badge" class="ident-badge">
                {{ badge }}<span v-if="index < badges.length - 1" class="ident-sep" aria-hidden="true">/</span>
              </span>
            </span>
          </div>

          <h1 class="display masthead-title">
            {{ title }}
          </h1>
          <p class="masthead-lede">
            {{ tagline }}
          </p>

          <p v-if="prompt" class="prompt">
            <span class="prompt-caret" aria-hidden="true">$</span>
            {{ prompt }}
          </p>

          <div class="masthead-actions">
            <a
              v-if="href"
              :href="href"
              target="_blank"
              rel="noopener"
              class="btn btn-primary action"
            >
              {{ primaryLabel || t('product.getStarted') }}
            </a>
            <NuxtLink v-else-if="to" :to="to" class="btn btn-primary action">
              {{ primaryLabel || t('product.getStarted') }}
            </NuxtLink>

            <a
              v-if="repo"
              :href="repo"
              target="_blank"
              rel="noopener"
              class="btn btn-ghost action"
            >
              <CodeXml class="action-icon" aria-hidden="true" />
              {{ t('product.github') }}
            </a>

            <slot name="actions" />
          </div>
        </div>

        <!-- The product's own art is shown as an object, not washed behind the
             copy: these are interface mockups, and they are only legible at
             full contrast. -->
        <figure class="masthead-visual">
          <!-- Interface art is authored as SVG; rasterising it through the
               image CDN would resample line work, so vectors ship as they are
               and only photographs take the transform. -->
          <img
            v-if="background.endsWith('.svg')"
            :src="background"
            alt=""
            width="1600"
            height="1000"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            :style="{ viewTransitionName: `product-hero-${slug}` }"
          >
          <NuxtImg
            v-else
            :src="background"
            :alt="''"
            width="1600"
            height="1000"
            sizes="sm:100vw lg:46vw"
            format="webp"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            :style="{ viewTransitionName: `product-hero-${slug}` }"
          />
        </figure>
      </div>
    </header>

    <section v-if="aboutTitle || aboutCards.length" class="band">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ aboutTitle }}
          </h2>
          <p v-if="aboutDesc" class="band-lede">
            {{ aboutDesc }}
          </p>
        </div>

        <ul v-if="aboutCards.length" class="fact-grid">
          <li v-for="card in aboutCards" :key="card.title" class="fact-block">
            <component :is="card.icon" class="fact-icon" aria-hidden="true" />
            <h3 class="fact-title">
              {{ card.title }}
            </h3>
            <p class="fact-desc">
              {{ card.desc }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <slot name="body" />

    <section v-if="featuresTitle || features.length" class="band">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ featuresTitle }}
          </h2>
          <p v-if="featuresDesc" class="band-lede">
            {{ featuresDesc }}
          </p>
        </div>

        <ul class="feature-grid">
          <li v-for="feature in features" :key="feature.title" class="feature">
            <component :is="feature.icon" class="feature-icon" aria-hidden="true" />
            <h3 class="feature-title">
              {{ feature.title }}
            </h3>
            <p class="feature-desc">
              {{ feature.desc }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <slot name="after-features" />

    <ProductDownloadsCta :slug="slug" :product-title="title" />

    <section v-if="reviews" class="band reviews">
      <div class="shell">
        <div class="reviews-head">
          <h2 class="band-title">
            {{ t('reviews.title') }}
          </h2>
          <ReviewForm
            v-model="reviewForm"
            v-model:open="reviewFormOpen"
            :submitting="submitting"
            :existing-review="!!myReview"
            @submit="handleSubmitReview"
            @delete="handleDeleteReview"
          >
            <template #trigger>
              <button
                v-if="!myReview && !myReviewLoading"
                type="button"
                class="btn btn-sm"
                @click="openReviewForm"
              >
                {{ t('reviews.writeReview') }}
              </button>
              <button
                v-else-if="!myReviewLoading"
                type="button"
                class="btn btn-sm btn-ghost"
                @click="openReviewForm"
              >
                {{ t('reviews.editReview') }}
              </button>
            </template>
          </ReviewForm>
        </div>

        <ReviewSummary
          v-if="summary"
          :average="summary.average"
          :count="summary.count"
          :distribution="{
            fiveStar: summary.fiveStar,
            fourStar: summary.fourStar,
            threeStar: summary.threeStar,
            twoStar: summary.twoStar,
            oneStar: summary.oneStar,
          }"
          class="reviews-summary"
        />

        <ReviewList
          :reviews="reviewItems"
          :sort="sort"
          :loading="reviewsLoading"
          :page="page"
          :total-pages="totalPages"
          @update:sort="setSort"
          @helpful="handleHelpful"
          @next-page="nextPage"
          @prev-page="prevPage"
        />
      </div>
    </section>

    <section v-if="repo" class="shell help">
      <div class="help-row">
        <div>
          <h2 class="help-title">
            {{ t('product.needHelp') }}
          </h2>
          <p class="help-desc">
            {{ t('product.helpDesc') }}
          </p>
        </div>
        <a :href="`${repo}/issues`" target="_blank" rel="noopener" class="btn btn-sm">
          <Bug class="action-icon" aria-hidden="true" />
          {{ t('product.reportIssue') }}
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.masthead {
  padding-block: 2rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.masthead-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.25rem;
  align-items: center;
}

.masthead-copy {
  max-width: 34rem;
}

.ident {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

/* App art is usually a glyph on its own square canvas, so it is contained,
   not cropped: cover would cut the outer strokes off a wide mark. */
.ident-mark {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-mark);
  object-fit: contain;
  background: #fff;
}

.ident-badges {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
}

.ident-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.ident-sep {
  color: var(--color-line);
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

.prompt {
  margin: 1.25rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.prompt-caret {
  margin-right: 0.4rem;
  color: var(--color-primary);
}

.masthead-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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

.masthead-visual {
  margin: 0;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-line-soft);
  background: var(--color-base-200);
}

.masthead-visual img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

/* Mockups are drawn on light canvases; on the dark field they would glare, so
   they are dimmed just enough to sit inside the page rather than on top. */
:global([data-theme='stargate']) .masthead-visual img {
  filter: brightness(0.86) contrast(1.02);
}

.band {
  padding-block: 3.5rem 0;
}

.band-head {
  max-width: 34rem;
  margin-bottom: 2rem;
}

.band-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.band-lede {
  margin: 0.6rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.fact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fact-block {
  padding-top: 1rem;
  border-top: 1px solid var(--color-line);
}

.fact-icon,
.feature-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  color: var(--color-primary);
}

.fact-title,
.feature-title {
  margin: 0.7rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.fact-desc,
.feature-desc {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.feature-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.feature {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  gap: 0 0.85rem;
  padding-block: 1rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.feature-icon {
  margin-top: 0.2rem;
  grid-row: span 2;
}

.feature-title {
  margin: 0;
}

.reviews {
  padding-top: 3.5rem;
}

.reviews-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.reviews-summary {
  margin-bottom: 1.5rem;
}

.help {
  padding-top: 3rem;
}

.help-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-line-soft);
}

.help-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.help-desc {
  margin: 0.35rem 0 0;
  max-width: 30rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

@media (min-width: 640px) {
  .fact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 2.5rem;
  }
}

@media (min-width: 1024px) {
  .masthead {
    padding-block: 2.75rem 3.25rem;
  }

  .masthead-grid {
    grid-template-columns: minmax(0, 32rem) minmax(0, 1fr);
    gap: 3.5rem;
  }

  .fact-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
