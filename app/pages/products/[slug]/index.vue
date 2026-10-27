<script setup lang="ts">
import { CodeXml } from "@lucide/vue";
import ProductDownloadsCta from "~/components/ProductDownloadsCta.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";


const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const lang = computed(() => locale.value);
const slug = computed(() => route.params.slug as string);

const { data: product } = await useAsyncData(
  `product-${lang.value}-${slug.value}`,
  () => {
    return queryCollection("products")
      .where("path", "=", `/products/${lang.value}/${slug.value}`)
      .first();
  },
);

const hasContent = computed(() => {
  if (!product.value?.body) return false;
  const body = product.value.body;
  if (typeof body === "string") return body.trim().length > 0;
  if (body?.children?.length > 0) return true;
  return false;
});

if (!product.value) {
  navigateTo(localePath("/products"));
}

// ==================== Reviews ====================
const { reviews, summary, loading: reviewsLoading, sort, setSort, page, totalPages, nextPage, prevPage, refresh: refreshReviews } = useProductReviews(slug.value)
const { myReview, loading: myReviewLoading, submitting, fetchMyReview, submit, update, remove } = useProductReviewSubmission(slug.value)
const reviewFormOpen = ref(false)
const reviewForm = ref({ rating: 0, title: "", content: "", isRecommended: null as boolean | null })

onMounted(async () => {
  await Promise.all([fetchMyReview(), refreshReviews()])
})

async function handleSubmitReview() {
  if (reviewForm.value.rating === 0) return
  try {
    if (myReview.value) {
      await update(reviewForm.value)
    } else {
      await submit(reviewForm.value)
    }
    reviewFormOpen.value = false
    await refreshReviews()
  } catch {
    // error surfaced via composable
  }
}

async function handleDeleteReview() {
  try {
    await remove()
    reviewFormOpen.value = false
    await refreshReviews()
  } catch {
    // error surfaced via composable
  }
}

async function handleHelpful(id: string) {
  await $fetch(`/api/products/${slug}/reviews/${id}/helpful`, { method: "POST" })
  await refreshReviews()
}

function openReviewForm() {
  if (myReview.value) {
    reviewForm.value = {
      rating: myReview.value.rating,
      title: myReview.value.title || "",
      content: myReview.value.content || "",
      isRecommended: myReview.value.isRecommended,
    }
  } else {
    reviewForm.value = { rating: 0, title: "", content: "", isRecommended: null }
  }
  reviewFormOpen.value = true
}

const title = computed(() => product.value?.title || "");
const description = computed(() => product.value?.description || "");
const hasPage = computed(() => product.value?.hasPage !== false);

// The fact ledger beside the title: only what the content actually declares.
function stampDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale.value === "zh" ? "zh-CN" : "en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const facts = computed(() => {
  const p = product.value;
  if (!p) return [];
  const rows: Array<{ label: string; value: string; mono?: boolean }> = [];
  if (p.series) rows.push({ label: t("products.series"), value: p.series });
  if (p.version) rows.push({ label: t("product.version"), value: `v${p.version}`, mono: true });
  const released = stampDate(p.releasedDate);
  if (released) rows.push({ label: t("product.releasedLabel"), value: released, mono: true });
  if (p.tags?.length) rows.push({ label: t("products.tags"), value: String(p.tags.length), mono: true });
  return rows;
});

definePageMeta({
  title: "",
  description: "",
});

useSeoMeta({
  title: () =>
    title.value ? `${title.value}` : `${t("seo.product.title", { name: "" })}`,
  description: () => description.value || t("seo.products.description"),
  ogTitle: () =>
    title.value ? `${title.value}` : `${t("seo.product.title", { name: "" })}`,
  ogDescription: description,
  ogImage: () => product.value?.background || undefined,
  twitterCard: "summary_large_image",
  twitterTitle: () =>
    title.value ? `${title.value}` : `${t("seo.product.title", { name: "" })}`,
  twitterDescription: description,
  twitterImage: () => product.value?.background || undefined,
});

// Schema.org Structured Data for Product
useSchemaOrg([
  defineProduct({
    name: title,
    description: description,
    image: () => product.value?.background,
    url: () => `https://solsynth.dev${route.path}`,
    brand: {
      "@type": "Brand",
      name: "Solsynth",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t("seo.home.title"),
        item: "https://solsynth.dev",
      },
      {
        name: t("seo.products.title"),
        item: `https://solsynth.dev${useLocalePath()("/products")}`,
      },
      {
        name: title,
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
]);
</script>


<template>
  <div v-if="product">
    <header class="masthead">
      <div class="shell">
        <nav class="crumbs" :aria-label="t('products.title')">
          <NuxtLink :to="localePath('/products')" class="crumb">
            {{ t('products.title') }}
          </NuxtLink>
          <span class="crumb-sep" aria-hidden="true">/</span>
          <span class="crumb-current">{{ title }}</span>
        </nav>

        <div class="masthead-grid">
          <div class="masthead-main">
            <div class="ident">
              <NuxtImg
                :src="product.icon"
                class="ident-mark"
                :alt="''"
                width="56"
                height="56"
                format="webp"
                loading="eager"
                decoding="async"
              />
              <span v-if="product.series" class="ident-series">{{ product.series }}</span>
            </div>

            <h1 class="display masthead-title">
              {{ title }}
            </h1>
            <p class="masthead-lede">
              {{ description }}
            </p>

            <div class="masthead-actions">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                rel="noopener"
                class="btn btn-primary action"
              >
                {{ hasPage ? t('product.open') : t('product.getStarted') }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                rel="noopener"
                class="btn btn-ghost action"
              >
                <CodeXml class="action-icon" aria-hidden="true" />
                {{ t('product.github') }}
              </a>
              <NuxtLink
                v-if="hasPage"
                :to="localePath(`/products/${slug}/releases`)"
                class="btn btn-ghost action"
              >
                {{ t('product.releases') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Facts print as a ledger, one row per attribute, with the value
               right-aligned so versions and dates line up when scanned. -->
          <dl v-if="facts.length" class="facts">
            <div v-for="fact in facts" :key="fact.label" class="fact">
              <dt>{{ fact.label }}</dt>
              <dd :class="{ mono: fact.mono }">{{ fact.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </header>

    <div class="shell">
      <figure class="cover">
        <NuxtImg
          :src="product.background"
          class="cover-img"
          :alt="title"
          width="1600"
          height="760"
          sizes="sm:100vw"
          format="webp"
          :style="{ viewTransitionName: `product-hero-${slug}` }"
          loading="eager"
          decoding="async"
        />
      </figure>
    </div>

    <div class="shell body">
      <div class="body-grid">
        <article v-if="hasContent" class="prose">
          <ContentRenderer :value="product" />
        </article>

        <article v-else class="prose">
          <h2>{{ lang === 'zh' ? `为什么选择 ${title}？` : `Why ${title}?` }}</h2>
          <p>
            {{
              lang === 'zh'
                ? '为创作者、开发者和连接者打造的平台。体验一个理解您热爱的平台。'
                : 'Built for those who create, code, and connect. Experience a platform that understands your passions.'
            }}
          </p>

          <h3>{{ lang === 'zh' ? '开发者优先' : 'Developer first' }}</h3>
          <p>
            {{
              lang === 'zh'
                ? '原生语法高亮、代码片段分享，与您喜爱的开发工具无缝集成。'
                : 'Native syntax highlighting, code snippet sharing, and seamless integration with your favorite dev tools.'
            }}
          </p>

          <h3>{{ lang === 'zh' ? '友好的社区' : 'A friendly community' }}</h3>
          <p>
            {{
              lang === 'zh'
                ? '加入志同道合者的活力社区。分享知识、提出问题、建立联系。'
                : 'Join a vibrant community of like-minded individuals. Share knowledge, ask questions, and connect.'
            }}
          </p>
        </article>

        <aside v-if="product.tags?.length" class="tags" :aria-label="t('products.tags')">
          <h2 class="tags-title">
            {{ t('products.tags') }}
          </h2>
          <div class="tags-list">
            <NuxtLink
              v-for="tag in product.tags"
              :key="tag"
              :to="`${localePath('/products')}?tag=${encodeURIComponent(tag)}`"
              class="chip"
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </aside>
      </div>
    </div>

    <ProductDownloadsCta :slug="slug" :product-title="product?.title" />

    <section class="reviews">
      <div class="shell">
        <div class="reviews-head">
          <h2 class="reviews-title">
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
          :reviews="reviews"
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
  </div>
</template>

<style scoped>
.masthead {
  padding-block: 2rem 1.75rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.75rem;
  font-size: 0.8125rem;
}

.crumb {
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.crumb:hover,
.crumb:focus-visible {
  color: var(--color-base-content);
}

.crumb-sep {
  color: var(--color-line);
}

.crumb-current {
  color: var(--color-dim);
}

.masthead-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}

.ident {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.ident-mark {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-mark);
  object-fit: cover;
  background: var(--color-base-300);
}

.ident-series {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
}

.masthead-title {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
}

.masthead-lede {
  margin: 1rem 0 0;
  max-width: 34rem;
  font-size: 1.125rem;
  line-height: 1.55;
  color: var(--color-dim);
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

.facts {
  margin: 0;
  align-self: start;
  border-top: 1px solid var(--color-line);
}

.fact {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.8125rem;
}

.fact dt {
  color: var(--color-faint);
}

.fact dd {
  margin: 0;
  text-align: right;
  color: var(--color-base-content);
}

.cover {
  margin: 0;
  margin-top: 2rem;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-line-soft);
  background: var(--color-base-200);
}

.cover-img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  object-fit: cover;
}

.body {
  padding-top: 2.5rem;
}

.body-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}

.tags-title {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.reviews {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--color-line-soft);
}

.reviews-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.reviews-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.reviews-summary {
  margin-bottom: 1.5rem;
}

@media (min-width: 900px) {
  .masthead {
    padding-block: 2.5rem 2.25rem;
  }

  .masthead-grid {
    grid-template-columns: minmax(0, 1fr) 16rem;
    gap: 3rem;
  }

  .body-grid {
    grid-template-columns: minmax(0, 42rem) minmax(0, 1fr);
    gap: 4rem;
  }
}
</style>
