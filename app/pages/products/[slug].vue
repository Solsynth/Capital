<script setup lang="ts">
import { ref, onMounted } from "vue"
import {
  CodeXml,
  ExternalLink,
  Bug,
  ArrowLeft,
  Tag,
  Folder,
  History,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "@lucide/vue";
import StarRating from "~/components/StarRating.vue";
import ReleaseCard from "~/components/ReleaseCard.vue";
import ReleaseTimeline from "~/components/ReleaseTimeline.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import { useProductReleases } from "~/composables/useProductReleases";
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

// ==================== Releases ====================
const { releases, latest, loading: releasesLoading, fetchReleases, fetchLatest } = useProductReleases(slug.value)
const showAllReleases = ref(false)
onMounted(async () => {
  await fetchLatest()
})

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
    <!-- Variant 1: Has markdown content -->
    <template v-if="hasContent">
      <div
        class="relative min-h-[56vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
      >
        <NuxtImg
          :src="product.background"
          class="absolute inset-0 w-full h-full object-cover -z-10 opacity-80"
          :alt="title"
          width="1920"
          height="1080"
          format="webp"
          :style="{ viewTransitionName: `product-hero-${slug}` }"
          loading="eager"
          decoding="async"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent"
        />

        <div class="relative container mx-auto px-4 pb-14 pt-40">
          <div class="max-w-2xl">
            <NuxtImg
              :src="product.icon"
              class="w-14 h-14 rounded-2xl shadow-lg mb-5"
              :alt="title"
              width="56"
              height="56"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <p v-if="product.series" class="eyebrow mb-3">{{ product.series }}</p>
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">
              {{ title }}
            </h1>
            <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed">
              {{ description }}
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary btn-md rounded-full px-6 gap-2"
              >
                <ExternalLink class="w-4 h-4" />
                {{ t("product.open") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-ghost rounded-full px-5 gap-2"
              >
                <CodeXml class="w-4 h-4" />
                {{ t("product.github") }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <article class="prose prose-lg max-w-3xl mx-auto">
          <ContentRenderer :value="product" />
        </article>
      </div>
    </template>

    <!-- Variant 2: hasPage but no content -->
    <template v-else-if="hasPage">
      <div
        class="relative min-h-[56vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
      >
        <NuxtImg
          :src="product.background"
          class="absolute inset-0 w-full h-full object-cover -z-10 opacity-80"
          :alt="title"
          width="1920"
          height="1080"
          format="webp"
          :style="{ viewTransitionName: `product-hero-${slug}` }"
          loading="eager"
          decoding="async"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent"
        />

        <div class="relative container mx-auto px-4 pb-14 pt-40">
          <div class="max-w-2xl">
            <NuxtImg
              :src="product.icon"
              class="w-14 h-14 rounded-2xl shadow-lg mb-5"
              :alt="title"
              width="56"
              height="56"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <p v-if="product.series" class="eyebrow mb-3">{{ product.series }}</p>
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">
              {{ title }}
            </h1>
            <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed">
              {{ description }}
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary btn-md rounded-full px-6"
              >
                {{ t("product.getStarted") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-ghost rounded-full px-5 gap-2"
              >
                <CodeXml class="w-4 h-4" />
                {{ t("product.github") }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-24">
        <section class="mb-16">
          <div class="max-w-2xl">
            <p class="eyebrow mb-3">{{ title }}</p>
            <h2 class="text-3xl font-semibold tracking-tight">
              {{ lang === "zh" ? `为什么选择 ${title}？` : `Why ${title}?` }}
            </h2>
            <p class="mt-4 opacity-70 leading-relaxed">
              {{
                lang === "zh"
                  ? "为创作者、开发者和连接者打造的平台。体验一个理解您热爱的平台。"
                  : "Built for those who create, code, and connect. Experience a platform that understands your passions."
              }}
            </p>
          </div>

          <div class="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-10">
            <div class="border-t border-base-content/10 pt-6">
              <h3 class="font-semibold">
                {{ lang === "zh" ? "开发者优先" : "Developer First" }}
              </h3>
              <p class="mt-1.5 text-sm opacity-60 leading-relaxed">
                {{
                  lang === "zh"
                    ? "原生语法高亮、代码片段分享，与您喜爱的开发工具无缝集成。"
                    : "Native syntax highlighting, code snippet sharing, and seamless integration with your favorite dev tools."
                }}
              </p>
            </div>
            <div class="border-t border-base-content/10 pt-6">
              <h3 class="font-semibold">OpenAPI</h3>
              <p class="mt-1.5 text-sm opacity-60 leading-relaxed">
                {{
                  lang === "zh"
                    ? "完全文档化的 API，透明的速率限制和风险控制。开发自己应用的绝佳起点！"
                    : "Fully documented API, transparent rate limiting and risk control. Great start for developing your own app!"
                }}
              </p>
            </div>
            <div class="border-t border-base-content/10 pt-6">
              <h3 class="font-semibold">ACG Culture</h3>
              <p class="mt-1.5 text-sm opacity-60 leading-relaxed">
                {{
                  lang === "zh"
                    ? "动漫、游戏爱好者的专属空间。分享您的作品、评论和热情。"
                    : "A dedicated space for Anime, Comic, and Game enthusiasts. Share your art, reviews, and passion."
                }}
              </p>
            </div>
            <div class="border-t border-base-content/10 pt-6">
              <h3 class="font-semibold">
                {{ lang === "zh" ? "友好的社区" : "Friendly Community" }}
              </h3>
              <p class="mt-1.5 text-sm opacity-60 leading-relaxed">
                {{
                  lang === "zh"
                    ? "加入志同道合者的活力社区。分享知识、提出问题、建立联系。"
                    : "Join a vibrant community of like-minded individuals. Share knowledge, ask questions, and connect."
                }}
              </p>
            </div>
          </div>
        </section>

        <section
          class="border-t border-base-content/10 pt-10 mb-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div class="max-w-xl">
            <h2 class="text-2xl font-semibold tracking-tight">
              {{ t("product.startJourney") }}
            </h2>
            <p class="mt-1.5 opacity-60">{{ t("product.available") }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <a
              v-if="product.url"
              :href="product.url"
              target="_blank"
              class="btn btn-primary rounded-full gap-2"
            >
              <ExternalLink class="w-4 h-4" />
              {{ t("product.openBrowser") }}
            </a>
            <a
              v-if="product.repo"
              :href="product.repo"
              target="_blank"
              class="btn btn-ghost rounded-full gap-2"
            >
              <CodeXml class="w-4 h-4" />
              {{ t("product.viewGithub") }}
            </a>
          </div>
        </section>

        <section
          class="border-t border-base-content/10 pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div class="max-w-xl">
            <h2 class="text-2xl font-semibold tracking-tight">
              {{ t("product.needHelp") }}
            </h2>
            <p class="mt-1.5 opacity-60">
              {{
                lang === "zh"
                  ? "请通过客户服务中心或 GitHub 报告问题。"
                  : "Feel free to contact your customer service or report a bug on GitHub."
              }}
            </p>
          </div>
          <a
            v-if="product.repo"
            :href="`${product.repo}/issues`"
            target="_blank"
            class="btn btn-outline rounded-full gap-2 shrink-0"
          >
            <Bug class="w-4 h-4" />
            {{ t("product.reportIssue") }}
          </a>
        </section>
      </div>
    </template>

    <!-- Variant 3: Simple card (no page) -->
    <template v-else>
      <div
        class="relative min-h-[56vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
      >
        <NuxtImg
          :src="product.background"
          class="absolute inset-0 w-full h-full object-cover -z-10 opacity-80"
          :alt="title"
          width="1920"
          height="1080"
          format="webp"
          loading="eager"
          decoding="async"
          :style="{ viewTransitionName: `product-hero-${slug}` }"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent"
        />

        <div class="relative container mx-auto px-4 pb-14 pt-40">
          <div class="max-w-2xl">
            <NuxtImg
              :src="product.icon"
              class="w-14 h-14 rounded-2xl shadow-lg mb-5"
              :alt="title"
              width="56"
              height="56"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <p v-if="product.series" class="eyebrow mb-3">{{ product.series }}</p>
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">
              {{ title }}
            </h1>
            <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed">
              {{ description }}
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary btn-md rounded-full px-6 gap-2"
              >
                <ExternalLink class="w-4 h-4" />
                {{ t("product.open") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-ghost rounded-full px-5 gap-2"
              >
                <CodeXml class="w-4 h-4" />
                {{ t("product.github") }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <div class="card bg-base-200 p-8 max-w-2xl mx-auto">
          <div class="flex items-center gap-3 mb-4">
            <NuxtImg
              :src="product.icon"
              class="w-12 h-12 rounded-lg"
              :alt="title"
              width="48"
              height="48"
              format="webp"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h2 class="text-xl font-bold">
                {{ title }}
              </h2>
              <span v-if="product.version" class="text-sm opacity-60"
                >v{{ product.version }}</span
              >
            </div>
          </div>

          <p class="opacity-80 mb-6">
            {{ description }}
          </p>

          <div
            v-if="product.tags?.length > 0 || product.series"
            class="flex flex-wrap gap-2 mb-6"
          >
            <NuxtLink
              v-if="product.series"
              :to="`${localePath('/products')}?series=${encodeURIComponent(product.series)}`"
              class="badge badge-primary badge-sm"
            >
              <Folder class="w-3 h-3 mr-1" />
              {{ product.series }}
            </NuxtLink>
            <NuxtLink
              v-for="tag in product.tags"
              :key="tag"
              :to="`${localePath('/products')}?tag=${encodeURIComponent(tag)}`"
              class="badge badge-outline badge-sm hover:badge-primary"
            >
              <Tag class="w-3 h-3 mr-1" />
              {{ tag }}
            </NuxtLink>
          </div>

          <div class="flex flex-wrap gap-4 text-sm">
            <a
              v-if="product.url"
              :href="product.url"
              target="_blank"
              class="btn btn-primary btn-sm"
            >
              <ExternalLink class="w-4 h-4" />
              {{ t("product.visitWebsite") }}
            </a>
            <a
              v-if="product.repo"
              :href="product.repo"
              target="_blank"
              class="btn btn-outline btn-sm"
            >
              <CodeXml class="w-4 h-4" />
              {{ t("product.sourceCode") }}
            </a>
            <NuxtLink
              :to="localePath('/products')"
              class="btn btn-ghost btn-sm"
            >
              <ArrowLeft class="w-4 h-4" />
              {{ t("products.backToProducts") }}
            </NuxtLink>
          </div>

          <p v-if="product.releasedDate" class="text-sm opacity-60 mt-4">
            {{ t("product.released") }} {{ product.releasedDate }}
          </p>
        </div>
      </div>
    </template>

    <!-- ==================== Releases Section ==================== -->
    <section v-if="latest || !releasesLoading" class="container mx-auto px-4 py-16">
      <div class="flex items-end justify-between gap-4 mb-6">
        <h2 class="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <History class="w-5 h-5 text-primary" />
          {{ t("releases.title") }}
        </h2>
        <button
          v-if="releases.length > 1"
          class="btn btn-sm btn-ghost gap-1"
          @click="showAllReleases = !showAllReleases"
        >
          {{ showAllReleases ? "Collapse" : t("releases.all") }}
          <ChevronUp v-if="showAllReleases" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Latest release card -->
      <ReleaseCard
        v-if="latest && !showAllReleases"
        :version="latest.version"
        :title="latest.title"
        :released-at="latest.releasedAt"
        :changelog="latest.changelog"
        :download-url="latest.downloadUrl"
        :is-prerelease="latest.isPrerelease"
      />

      <!-- All releases timeline -->
      <ReleaseTimeline
        v-else-if="showAllReleases && releases.length > 0"
        :releases="releases"
      />

      <!-- Fetch all releases when expanded -->
      <div v-if="showAllReleases && releases.length <= 1 && !releasesLoading" class="text-center py-4">
        <p class="opacity-60">{{ t("releases.noReleases") }}</p>
      </div>

      <!-- Empty state -->
      <div v-if="!latest && !releasesLoading" class="text-center py-4">
        <p class="opacity-60">{{ t("releases.noReleases") }}</p>
      </div>
    </section>

    <!-- ==================== Reviews Section ==================== -->
    <section class="container mx-auto px-4 pb-24">
      <div class="max-w-xl mb-10">
        <p class="eyebrow mb-3">{{ t("reviews.title") }}</p>
        <h2 class="text-3xl font-semibold tracking-tight">
          {{ t("reviews.shareExperience") }}
        </h2>
      </div>

      <!-- Review Summary -->
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
        class="mb-6"
      />

      <!-- Write Review Form -->
      <div v-if="!myReviewLoading" class="mb-6">
        <ReviewForm
          v-model="reviewForm"
          v-model:open="reviewFormOpen"
          :submitting="submitting"
          :existing-review="!!myReview"
          @submit="handleSubmitReview"
          @delete="handleDeleteReview"
        >
          <template #trigger>
            <span
              v-if="!myReview"
              class="btn btn-primary btn-sm gap-2"
              @click="openReviewForm"
            >
              <MessageSquare class="w-4 h-4" />
              {{ t("reviews.writeReview") }}
            </span>
            <span
              v-else
              class="btn btn-outline btn-sm gap-2"
              @click="openReviewForm"
            >
              <MessageSquare class="w-4 h-4" />
              {{ t("reviews.editReview") }}
            </span>
          </template>
        </ReviewForm>
      </div>

      <!-- Reviews List -->
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
    </section>
  </div>
</template>

<style scoped>
.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.5;
}
</style>
