<script setup lang="ts">
import { computed } from "vue";
import { ArrowLeft, Calendar, CodeXml, Download, Layers, Package, ScrollText } from "@lucide/vue";
import type { ProductRelease, ProductReleaseArtifact } from "~/types/release";
import { artifactPlatformLabel, formatArtifactSize, startDownload } from "~/utils/download";
import { renderMarkdown } from "~/utils/marked";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const lang = computed(() => locale.value as string);
const slug = computed(() => route.params.slug as string);
// Undefined on `/products/:slug/releases`, where the newest release is shown.
const requestedVersion = computed(() => (route.params.version as string | undefined) || undefined);

const { data: product } = await useAsyncData(
  `release-product-${lang.value}-${slug.value}`,
  () =>
    queryCollection("products")
      .where("path", "=", `/products/${lang.value}/${slug.value}`)
      .first(),
);

if (!product.value) {
  await navigateTo(localePath("/products"));
}

// The list carries every version the page needs, so a single request backs both the
// sidebar and the release being displayed.
const { data: releasesResponse } = await useAsyncData(
  `releases-${slug.value}`,
  () =>
    $fetch<{ releases: ProductRelease[] }>(
      `/api/products/${encodeURIComponent(slug.value)}/releases?limit=100`,
    ).catch(() => null),
);

const releases = computed(() => releasesResponse.value?.releases ?? []);
const loadFailed = computed(() => releasesResponse.value === null);
const release = computed(() => {
  if (!releases.value.length) return null;
  const wanted = requestedVersion.value;
  // No version, or the `latest` alias, resolves to the newest release.
  if (!wanted || wanted === "latest") return releases.value[0];
  return releases.value.find(
    (entry) => entry.version === wanted || `v${entry.version}` === wanted,
  ) ?? null;
});

const productTitle = computed(() => product.value?.title || slug.value);
const hubPath = computed(() => `/products/${slug.value}/releases`);
const versionPath = (releaseVersion: string) =>
  localePath(`/products/${slug.value}/releases/${encodeURIComponent(releaseVersion)}`);

// An unknown version falls back to the product's release hub.
if (requestedVersion.value && !release.value) {
  await navigateTo(localePath(hubPath.value));
}

// `/releases/latest` and `v`-prefixed versions resolve to a concrete release, so send
// the browser to its canonical URL and keep one indexable URL per version.
const canonicalVersion = computed(() => release.value?.version ?? null);
if (
  requestedVersion.value
  && canonicalVersion.value
  && requestedVersion.value !== canonicalVersion.value
) {
  await navigateTo(versionPath(canonicalVersion.value), { redirectCode: 301 });
}

const artifacts = computed(() => release.value?.artifacts ?? []);
const orderedArtifacts = computed(() => [
  ...artifacts.value.filter((artifact) => !artifact.expired && artifact.download_url),
  ...artifacts.value.filter((artifact) => artifact.expired || !artifact.download_url),
]);
const changelogHtml = computed(() => renderMarkdown(release.value?.changelog || ""));
const accent = computed(() => product.value?.color || null);
const showStatus = computed(
  () => Boolean(release.value?.status && release.value.status !== "published"),
);
const releasedLabel = computed(() => formatDate(release.value?.releasedAt));

function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale.value === "zh" ? "zh-CN" : "en-US", options ?? {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function artifactUploadDate(artifact: ProductReleaseArtifact): string | null {
  return formatDate(artifact.uploaded_at || artifact.created_at);
}

const { downloaded } = useDownloadReceipt();

function handleDownloadClick(event: MouseEvent, artifact: ProductReleaseArtifact) {
  if (!artifact.download_url || artifact.expired) return;
  // Keep ctrl/middle-click new-tab behaviour on the plain link.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  startDownload(artifact.download_url);
  downloaded({
    artifact,
    url: artifact.download_url,
    productTitle: productTitle.value,
    version: release.value?.version ?? null,
  });
}

// View-transition names must be valid CSS identifiers, so version strings are flattened.
function transitionName(part: string, value?: string): string {
  const safe = value ? `-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}` : "";
  return `${part}-${slug.value}${safe}`;
}

definePageMeta({
  title: "",
  description: "",
});

const title = computed(() =>
  release.value ? `${productTitle.value} v${release.value.version}` : `${productTitle.value} ${t("releases.title")}`
);
const description = computed(() =>
  release.value?.title || product.value?.description || t("seo.products.description")
);
const productDescription = computed(() => product.value?.description || t("seo.products.description"));
const canonicalHref = computed(() =>
  canonicalVersion.value
    ? `https://solsynth.dev${versionPath(canonicalVersion.value)}`
    : `https://solsynth.dev${localePath(hubPath.value)}`
);

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogImage: () => product.value?.background || undefined,
  ogType: release.value ? "article" : "website",
  twitterCard: "summary_large_image",
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => product.value?.background || undefined,
});

// The layout renders its canonical from the route path; this page resolves an alias
// (`/releases`) to the concrete release, so it owns the same key to point at the one URL.
useHead({
  link: [{ rel: "canonical", href: canonicalHref, key: "canonical" }],
});

useSchemaOrg([
  defineProduct({
    name: productTitle,
    description: productDescription,
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
  // The layout already contributes the Home crumb, so this list starts at Products.
  defineBreadcrumb({
    itemListElement: [
      {
        name: t("products.title"),
        item: `https://solsynth.dev${localePath("/products")}`,
      },
      {
        name: productTitle.value,
        item: `https://solsynth.dev${localePath(`/products/${slug.value}`)}`,
      },
      {
        name: t("releases.title"),
        item: `https://solsynth.dev${localePath(hubPath.value)}`,
      },
    ],
  }),
]);
</script>

<template>
  <div>
    <!-- Shared spine: identical on the hub and on every version, so it holds still while
         the sidebar and the release panel change. -->
    <header
      class="border-b border-base-200 px-4 pt-8 pb-8"
      :style="{ viewTransitionName: transitionName('release-header') }"
    >
      <div class="container mx-auto">
        <nav :aria-label="t('releasePage.breadcrumbLabel')" class="mb-7">
          <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs opacity-55">
            <li>
              <NuxtLink :to="localePath('/')" class="hover:opacity-100">
                {{ t("seo.home.title") }}
              </NuxtLink>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <NuxtLink :to="localePath('/products')" class="hover:opacity-100">
                {{ t("products.title") }}
              </NuxtLink>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <NuxtLink :to="localePath(`/products/${slug}`)" class="hover:opacity-100">
                {{ productTitle }}
              </NuxtLink>
            </li>
            <li aria-hidden="true">/</li>
            <li class="opacity-100">
              <NuxtLink :to="localePath(hubPath)" class="hover:opacity-100">
                {{ t("releases.title") }}
              </NuxtLink>
            </li>
          </ol>
        </nav>

        <div class="flex flex-wrap items-center gap-4">
          <NuxtImg
            v-if="product?.icon"
            :src="product.icon"
            class="w-12 h-12 rounded-xl shrink-0"
            :alt="productTitle"
            width="48"
            height="48"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <div class="min-w-0 flex-1">
            <p class="eyebrow mb-1.5">{{ product?.series || t("seo.siteName") }}</p>
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">
              <NuxtLink :to="localePath(`/products/${slug}`)" class="hover:text-primary transition-colors">
                {{ productTitle }}
              </NuxtLink>
            </h1>
          </div>
          <span
            v-if="accent"
            class="h-10 w-1 rounded-full shrink-0"
            :style="{ backgroundColor: accent }"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-10">
      <div class="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
        <nav
          :aria-label="t('releasePage.allVersions')"
          class="min-w-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
          :style="{ viewTransitionName: transitionName('release-versions') }"
        >
          <h2
            id="release-versions-heading"
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-55"
          >
            <Layers class="w-4 h-4" aria-hidden="true" />
            {{ t("releasePage.allVersions") }}
            <span v-if="releases.length" class="ml-auto font-mono opacity-60">
              {{ releases.length }}
            </span>
          </h2>

          <ol v-if="releases.length" class="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1 lg:max-h-none">
            <li v-for="(entry, index) in releases" :key="entry.id">
              <NuxtLink
                :to="versionPath(entry.version)"
                class="block rounded-lg px-3 py-2.5 transition-colors"
                :class="
                  entry.version === release?.version
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-base-300/60'
                "
                :aria-current="entry.version === release?.version ? 'page' : undefined"
                :style="{ viewTransitionName: transitionName('release-version', entry.version) }"
              >
                <span class="flex items-center gap-2">
                  <span class="font-mono text-sm" :class="entry.version === release?.version ? 'font-semibold' : ''">
                    v{{ entry.version }}
                  </span>
                  <span v-if="index === 0" class="badge badge-primary badge-xs shrink-0">
                    {{ t("releasePage.latest") }}
                  </span>
                  <span v-if="entry.isPrerelease" class="badge badge-warning badge-xs shrink-0">
                    {{ t("releases.prerelease") }}
                  </span>
                  <span
                    v-if="entry.artifacts.length && entry.artifactsExpired"
                    class="badge badge-error badge-outline badge-xs shrink-0"
                  >
                    {{ t("releases.expired") }}
                  </span>
                </span>
                <span class="mt-0.5 flex items-baseline gap-2 text-xs opacity-60">
                  <span v-if="entry.title" class="min-w-0 flex-1 truncate">{{ entry.title }}</span>
                  <time
                    v-if="formatDate(entry.releasedAt, { year: 'numeric', month: 'short' })"
                    :datetime="entry.releasedAt || ''"
                    class="ml-auto shrink-0 tabular-nums"
                  >
                    {{ formatDate(entry.releasedAt, { year: "numeric", month: "short" }) }}
                  </time>
                </span>
              </NuxtLink>
            </li>
          </ol>

          <p v-else class="mt-3 text-sm opacity-60">{{ t("releases.noReleases") }}</p>

          <NuxtLink :to="localePath(`/products/${slug}`)" class="btn btn-ghost btn-sm mt-3 gap-2">
            <ArrowLeft class="w-4 h-4" aria-hidden="true" />
            {{ t("releasePage.backToProduct", { name: productTitle }) }}
          </NuxtLink>
        </nav>

        <div class="min-w-0" :style="{ viewTransitionName: transitionName('release-detail') }">
          <template v-if="release">
            <h2
              id="release-version-heading"
              class="font-mono text-3xl md:text-4xl font-extrabold tracking-tight break-words"
            >
              v{{ release.version }}
            </h2>
            <p v-if="release.title" class="mt-3 text-lg md:text-xl opacity-75 leading-relaxed">
              {{ release.title }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-2">
              <span v-if="release.isPrerelease" class="badge badge-warning badge-sm">
                {{ t("releases.prerelease") }}
              </span>
              <span
                v-if="artifacts.length && release.artifactsExpired"
                class="badge badge-error badge-outline badge-sm"
              >
                {{ t("releases.expired") }}
              </span>
              <span v-if="showStatus" class="badge badge-ghost badge-sm font-mono">
                {{ release.status }}
              </span>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm opacity-60">
              <span v-if="releasedLabel" class="inline-flex items-center gap-1.5">
                <Calendar class="w-4 h-4" aria-hidden="true" />
                <span>{{ t("releases.releasedOn") }}</span>
                <time :datetime="release.releasedAt || ''">{{ releasedLabel }}</time>
              </span>
              <span v-if="release.minimumVersion">
                {{ t("releasePage.requires", { version: release.minimumVersion }) }}
              </span>
            </div>

            <section class="mt-12" aria-labelledby="release-notes-heading">
              <h3
                id="release-notes-heading"
                class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-55"
              >
                <ScrollText class="w-4 h-4" aria-hidden="true" />
                {{ t("releasePage.notes") }}
              </h3>
              <div
                v-if="changelogHtml"
                class="prose prose-sm max-w-none mt-5 release-notes"
                v-html="changelogHtml"
              />
              <div
                v-else
                class="mt-5 rounded-xl border border-dashed border-base-content/10 bg-base-200/50 px-5 py-6 text-sm opacity-60"
              >
                {{ t("releases.noNotes") }}
              </div>
            </section>

            <section class="mt-12" aria-labelledby="release-downloads-heading">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h3
                  id="release-downloads-heading"
                  class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-55"
                >
                  <Package class="w-4 h-4" aria-hidden="true" />
                  {{ t("releasePage.downloads") }}
                </h3>
                <div class="flex flex-wrap items-center gap-3">
                  <span v-if="artifacts.length" class="text-xs font-mono opacity-45">
                    {{ t("releasePage.fileCount", { count: artifacts.length }) }}
                  </span>
                  <ExpressMark />
                </div>
              </div>

              <div
                v-if="artifacts.length && release.artifactsExpired"
                class="mt-5 rounded-xl border border-dashed border-warning/30 bg-warning/5 px-5 py-3.5 text-sm opacity-80"
              >
                {{ t("releases.expiredDetails") }}
              </div>

              <div v-if="orderedArtifacts.length" class="mt-5 space-y-3">
                <div
                  v-for="(artifact, index) in orderedArtifacts"
                  :key="artifact.id || `${artifact.platform}-${artifact.architecture}-${artifact.file_name}-${index}`"
                  class="rounded-xl border border-base-content/5 bg-base-200/60 px-4 py-3.5 sm:px-5"
                >
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <span class="badge badge-ghost badge-sm font-mono shrink-0">
                      {{ artifactPlatformLabel(artifact.platform) || t("releasePage.unknownPlatform") }}
                    </span>
                    <span
                      v-if="artifact.architecture"
                      class="text-[11px] font-mono uppercase tracking-wide opacity-45 shrink-0"
                    >
                      {{ artifact.architecture }}
                    </span>
                    <span class="min-w-0 flex-1 basis-40 truncate font-mono text-sm">
                      {{ artifact.file_name || t("releasePage.unnamedFile") }}
                    </span>
                    <span v-if="formatArtifactSize(artifact.size)" class="text-xs tabular-nums opacity-50 shrink-0">
                      {{ formatArtifactSize(artifact.size) }}
                    </span>
                    <a
                      v-if="artifact.download_url && !artifact.expired"
                      :href="artifact.download_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-sm btn-primary shrink-0 gap-1.5"
                      @click="handleDownloadClick($event, artifact)"
                    >
                      <Download class="w-3.5 h-3.5" aria-hidden="true" />
                      {{ t("releases.download") }}
                    </a>
                    <span v-else class="badge badge-error badge-outline badge-sm shrink-0">
                      {{ t("releases.expired") }}
                    </span>
                  </div>
                  <div
                    v-if="artifact.hash || artifactUploadDate(artifact)"
                    class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-50"
                  >
                    <span v-if="artifactUploadDate(artifact)">
                      {{ t("releases.artifact.uploadedOn") }} {{ artifactUploadDate(artifact) }}
                    </span>
                    <code v-if="artifact.hash" class="font-mono break-all" :title="artifact.hash">
                      {{ t("releases.artifact.checksum") }} · {{ artifact.hash }}
                    </code>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="mt-5 rounded-xl border border-dashed border-base-content/10 bg-base-200/50 px-5 py-6 text-sm opacity-60"
              >
                {{ t("releasePage.noArtifacts") }}
              </div>
            </section>

            <a
              v-if="product?.repo"
              :href="product.repo"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost btn-sm mt-10 gap-2"
            >
              <CodeXml class="w-4 h-4" aria-hidden="true" />
              {{ t("product.sourceCode") }}
            </a>
          </template>

          <div
            v-else
            class="rounded-xl border border-dashed border-base-content/10 bg-base-200/50 px-5 py-8"
          >
            <p class="font-medium">{{ t("releases.noReleases") }}</p>
            <p class="mt-1.5 text-sm opacity-60">
              {{ loadFailed ? t("releasePage.loadFailed") : t("releasePage.emptyHint") }}
            </p>
          </div>
        </div>
      </div>
    </div>
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

.release-notes :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.release-notes :deep(ul),
.release-notes :deep(ol) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.release-notes :deep(pre) {
  overflow-x: auto;
}

.release-notes :deep(pre),
.release-notes :deep(code) {
  font-size: 0.85em;
}

.release-notes :deep(h1),
.release-notes :deep(h2),
.release-notes :deep(h3) {
  margin-top: 0.75em;
  margin-bottom: 0.35em;
}
</style>
