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
      <div class="relative h-[40vh] min-h-75">
        <img
          :src="product.background"
          class="w-full h-full object-cover"
          :alt="title"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent"
        />

        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div
            class="container mx-auto flex flex-col md:flex-row items-end gap-6"
          >
            <img
              :src="product.icon"
              class="w-20 h-20 rounded-2xl shadow-xl"
              :alt="title"
            />
            <div class="flex-1">
              <h1 class="text-3xl md:text-4xl font-bold mb-2">
                {{ title }}
              </h1>
              <p class="text-lg opacity-80">
                {{ description }}
              </p>
              <div
                v-if="product.tags?.length > 0 || product.series"
                class="flex flex-wrap gap-2 mt-3"
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
            </div>
            <div class="flex gap-3 flex-wrap">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary"
              >
                <ExternalLink class="w-5 h-5" />
                {{ t("product.open") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-outline"
              >
                <CodeXml class="w-5 h-5" />
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
      <div class="relative h-[50vh] min-h-100">
        <img
          :src="product.background"
          class="w-full h-full object-cover"
          :alt="title"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent"
        />

        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div
            class="container mx-auto flex flex-col md:flex-row items-end gap-6"
          >
            <img
              :src="product.icon"
              class="w-24 h-24 rounded-2xl shadow-xl"
              :alt="title"
            />
            <div class="flex-1">
              <h1 class="text-4xl md:text-5xl font-bold mb-2">
                {{ title }}
              </h1>
              <p class="text-lg opacity-80">
                {{ description }}
              </p>
              <div
                v-if="product.tags?.length > 0 || product.series"
                class="flex flex-wrap gap-2 mt-3"
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
            </div>
            <div class="flex gap-3 flex-wrap">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary btn-lg rounded-full"
              >
                {{ t("product.getStarted") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-outline btn-lg rounded-full"
              >
                <CodeXml class="w-5 h-5" />
                {{ t("product.github") }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-16">
        <section class="mb-16">
          <h2 class="text-3xl font-bold mb-4 text-center">
            {{ lang === "zh" ? `为什么选择 ${title}？` : `Why ${title}?` }}
          </h2>
          <p class="text-lg opacity-70 text-center max-w-2xl mx-auto mb-12">
            {{
              lang === "zh"
                ? "为创作者、开发者和连接者打造的平台。体验一个理解您热爱的平台。"
                : "Built for those who create, code, and connect. Experience a platform that understands your passions."
            }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="card bg-base-200 p-8">
              <h3 class="text-xl font-bold mb-3 text-primary">
                {{ lang === "zh" ? "开发者优先" : "Developer First" }}
              </h3>
              <p class="opacity-80">
                {{
                  lang === "zh"
                    ? "原生语法高亮、代码片段分享，与您喜爱的开发工具无缝集成。"
                    : "Native syntax highlighting, code snippet sharing, and seamless integration with your favorite dev tools."
                }}
              </p>
            </div>
            <div class="card bg-base-200 p-8">
              <h3 class="text-xl font-bold mb-3 text-primary">OpenAPI</h3>
              <p class="opacity-80">
                {{
                  lang === "zh"
                    ? "完全文档化的 API，透明的速率限制和风险控制。开发自己应用的绝佳起点！"
                    : "Fully documented API, transparent rate limiting and risk control. Great start for developing your own app!"
                }}
              </p>
            </div>
            <div class="card bg-base-200 p-8">
              <h3 class="text-xl font-bold mb-3 text-primary">ACG Culture</h3>
              <p class="opacity-80">
                {{
                  lang === "zh"
                    ? "动漫、游戏爱好者的专属空间。分享您的作品、评论和热情。"
                    : "A dedicated space for Anime, Comic, and Game enthusiasts. Share your art, reviews, and passion."
                }}
              </p>
            </div>
            <div class="card bg-base-200 p-8">
              <h3 class="text-xl font-bold mb-3 text-primary">
                {{ lang === "zh" ? "友好的社区" : "Friendly Community" }}
              </h3>
              <p class="opacity-80">
                {{
                  lang === "zh"
                    ? "加入志同道合者的活力社区。分享知识、提出问题、建立联系。"
                    : "Join a vibrant community of like-minded individuals. Share knowledge, ask questions, and connect."
                }}
              </p>
            </div>
          </div>
        </section>

        <section class="mb-16">
          <div class="card bg-linear-to-r from-primary/10 to-secondary/10 p-8">
            <h2 class="text-3xl font-bold mb-4">
              {{ t("product.startJourney") }}
            </h2>
            <p class="text-lg opacity-80 mb-6">
              {{ t("product.available") }}
            </p>
            <div class="flex flex-wrap gap-4">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary"
              >
                <ExternalLink class="w-5 h-5" />
                {{ t("product.openBrowser") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-outline"
              >
                <CodeXml class="w-5 h-5" />
                {{ t("product.viewGithub") }}
              </a>
            </div>
          </div>
        </section>

        <section>
          <div class="card bg-base-200 p-8">
            <h2 class="text-3xl font-bold mb-4">
              {{ t("product.needHelp") }}
            </h2>
            <p class="text-lg opacity-80 mb-6">
              {{
                lang === "zh"
                  ? "请通过客户服务中心或 GitHub 报告问题。"
                  : "Feel free to contact your customer service or report a bug on GitHub."
              }}
            </p>
            <div class="flex gap-4">
              <a
                v-if="product.repo"
                :href="`${product.repo}/issues`"
                target="_blank"
                class="btn btn-outline"
              >
                <Bug class="w-5 h-5" />
                {{ t("product.reportIssue") }}
              </a>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- Variant 3: Simple card (no page) -->
    <template v-else>
      <div class="relative h-[40vh] min-h-75">
        <img
          :src="product.background"
          class="w-full h-full object-cover"
          :alt="title"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent"
        />

        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div
            class="container mx-auto flex flex-col md:flex-row items-end gap-6"
          >
            <img
              :src="product.icon"
              class="w-20 h-20 rounded-2xl shadow-xl"
              :alt="title"
            />
            <div class="flex-1">
              <h1 class="text-3xl md:text-4xl font-bold mb-2">
                {{ title }}
              </h1>
              <p class="text-lg opacity-80">
                {{ description }}
              </p>
              <div
                v-if="product.tags?.length > 0 || product.series"
                class="flex flex-wrap gap-2 mt-3"
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
            </div>
            <div class="flex gap-3 flex-wrap">
              <a
                v-if="product.url"
                :href="product.url"
                target="_blank"
                class="btn btn-primary"
              >
                <ExternalLink class="w-5 h-5" />
                {{ t("product.open") }}
              </a>
              <a
                v-if="product.repo"
                :href="product.repo"
                target="_blank"
                class="btn btn-outline"
              >
                <CodeXml class="w-5 h-5" />
                {{ t("product.github") }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <div class="card bg-base-200 p-8 max-w-2xl mx-auto">
          <div class="flex items-center gap-3 mb-4">
            <img
              :src="product.icon"
              class="w-12 h-12 rounded-lg"
              :alt="title"
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
    <section v-if="latest || !releasesLoading" class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
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
    <section class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <MessageSquare class="w-5 h-5 text-primary" />
          {{ t("reviews.title") }}
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
