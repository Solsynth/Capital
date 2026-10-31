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
    <header class="band" :style="{ viewTransitionName: transitionName('release-header') }">
      <div class="shell">
        <nav :aria-label="t('releasePage.breadcrumbLabel')" class="crumbs">
          <NuxtLink :to="localePath('/')" class="crumb">{{ t('seo.home.title') }}</NuxtLink>
          <span class="crumb-sep" aria-hidden="true">/</span>
          <NuxtLink :to="localePath('/products')" class="crumb">{{ t('products.title') }}</NuxtLink>
          <span class="crumb-sep" aria-hidden="true">/</span>
          <NuxtLink :to="localePath(`/products/${slug}`)" class="crumb">{{ productTitle }}</NuxtLink>
          <span class="crumb-sep" aria-hidden="true">/</span>
          <NuxtLink :to="localePath(hubPath)" class="crumb is-current">{{ t('releases.title') }}</NuxtLink>
        </nav>

        <div class="title-row">
          <NuxtImg
            v-if="product?.icon"
            :src="product.icon"
            class="title-mark"
            :alt="''"
            width="48"
            height="48"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <div class="title-copy">
            <p v-if="product?.series" class="title-series">{{ product.series }}</p>
            <h1 class="title-name">
              <NuxtLink :to="localePath(`/products/${slug}`)">{{ productTitle }}</NuxtLink>
            </h1>
          </div>
        </div>
      </div>
    </header>

    <div class="shell body">
      <div class="grid">
        <nav
          :aria-label="t('releasePage.allVersions')"
          class="versions"
          :style="{ viewTransitionName: transitionName('release-versions') }"
        >
          <div class="versions-header">
            <div class="versions-title-wrap">
              <Layers class="head-icon" aria-hidden="true" />
              <h2 class="versions-head">{{ t('releasePage.allVersions') }}</h2>
            </div>
            <span v-if="releases.length" class="mono versions-count">{{ releases.length }}</span>
          </div>

          <ol v-if="releases.length" class="versions-list">
            <li v-for="(entry, index) in releases" :key="entry.id">
              <NuxtLink
                :to="versionPath(entry.version)"
                class="version"
                :class="{ 'is-current': entry.version === release?.version }"
                :aria-current="entry.version === release?.version ? 'page' : undefined"
                :style="{ viewTransitionName: transitionName('release-version', entry.version) }"
              >
                <div class="version-row">
                  <div class="version-badge-group">
                    <span class="mono version-number">v{{ entry.version }}</span>
                    <span v-if="index === 0" class="version-tag is-latest">{{ t('releasePage.latest') }}</span>
                    <span v-if="entry.isPrerelease" class="version-tag is-prerelease">{{ t('releases.prerelease') }}</span>
                    <span
                      v-if="entry.artifacts.length && entry.artifactsExpired"
                      class="version-tag is-expired"
                    >
                      {{ t('releases.expired') }}
                    </span>
                  </div>
                  <time
                    v-if="formatDate(entry.releasedAt, { year: 'numeric', month: 'short' })"
                    :datetime="entry.releasedAt || ''"
                    class="mono version-date"
                  >
                    {{ formatDate(entry.releasedAt, { year: 'numeric', month: 'short' }) }}
                  </time>
                </div>
                <p v-if="entry.title && entry.title !== entry.version" class="version-title">
                  {{ entry.title }}
                </p>
              </NuxtLink>
            </li>
          </ol>

          <p v-else class="versions-empty">
            {{ t('releases.noReleases') }}
          </p>

          <NuxtLink :to="localePath(`/products/${slug}`)" class="versions-back">
            <ArrowLeft class="back-icon" aria-hidden="true" />
            <span>{{ t('releasePage.backToProduct', { name: productTitle }) }}</span>
          </NuxtLink>
        </nav>

        <div class="detail" :style="{ viewTransitionName: transitionName('release-detail') }">
          <template v-if="release">
            <div class="detail-head">
              <h2 class="mono detail-version">
                v{{ release.version }}
              </h2>
              <p v-if="release.title && release.title !== release.version" class="detail-title">
                {{ release.title }}
              </p>

              <div v-if="release.isPrerelease || (artifacts.length && release.artifactsExpired) || showStatus" class="detail-tags">
                <span v-if="release.isPrerelease" class="version-tag">{{ t('releases.prerelease') }}</span>
                <span v-if="artifacts.length && release.artifactsExpired" class="version-tag is-expired">
                  {{ t('releases.expired') }}
                </span>
                <span v-if="showStatus" class="mono detail-status">{{ release.status }}</span>
              </div>

              <dl class="detail-facts">
                <div v-if="releasedLabel" class="fact">
                  <dt>{{ t('releases.releasedOn') }}</dt>
                  <dd class="mono">
                    <time :datetime="release.releasedAt || ''">{{ releasedLabel }}</time>
                  </dd>
                </div>
                <div v-if="release.minimumVersion" class="fact">
                  <dt>{{ t('releasePage.requires', { version: release.minimumVersion }) }}</dt>
                  <dd class="mono">v{{ release.minimumVersion }}</dd>
                </div>
              </dl>
            </div>

            <section class="detail-section" aria-labelledby="release-notes-heading">
              <h3 id="release-notes-heading" class="section-head">
                <ScrollText class="head-icon" aria-hidden="true" />
                {{ t('releasePage.notes') }}
              </h3>
              <div v-if="changelogHtml" class="prose release-notes" v-html="changelogHtml" />
              <p v-else class="section-empty">
                {{ t('releases.noNotes') }}
              </p>
            </section>

            <section class="detail-section" aria-labelledby="release-downloads-heading">
              <div class="section-head-row">
                <h3 id="release-downloads-heading" class="section-head">
                  <Package class="head-icon" aria-hidden="true" />
                  {{ t('releasePage.downloads') }}
                </h3>
                <span v-if="artifacts.length" class="mono section-count">
                  {{ artifacts.length === 1 ? t('releasePage.fileCount_one') : t('releasePage.fileCount_other', { count: artifacts.length }) }}
                </span>
              </div>

              <p v-if="artifacts.length && release.artifactsExpired" class="note note-warning expired-note">
                {{ t('releases.expiredDetails') }}
              </p>

              <ul v-if="orderedArtifacts.length" class="artifacts">
                <li
                  v-for="(artifact, index) in orderedArtifacts"
                  :key="artifact.id || `${artifact.platform}-${artifact.architecture}-${artifact.file_name}-${index}`"
                  class="artifact"
                >
                  <div class="artifact-main">
                    <span class="mono artifact-platform">
                      {{ artifactPlatformLabel(artifact.platform) || t('releasePage.unknownPlatform') }}
                    </span>
                    <span v-if="artifact.architecture" class="mono artifact-arch">{{ artifact.architecture }}</span>
                    <span class="mono artifact-file">{{ artifact.file_name || t('releasePage.unnamedFile') }}</span>
                    <span v-if="formatArtifactSize(artifact.size)" class="mono artifact-size">
                      {{ formatArtifactSize(artifact.size) }}
                    </span>
                    <a
                      v-if="artifact.download_url && !artifact.expired"
                      :href="artifact.download_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-sm btn-primary artifact-download"
                      @click="handleDownloadClick($event, artifact)"
                    >
                      <Download class="download-icon" aria-hidden="true" />
                      {{ t('releases.download') }}
                    </a>
                    <span v-else class="artifact-expired">{{ t('releases.expired') }}</span>
                  </div>

                  <div v-if="artifact.hash || artifactUploadDate(artifact)" class="artifact-meta">
                    <span v-if="artifactUploadDate(artifact)" class="mono">
                      {{ t('releases.artifact.uploadedOn') }} {{ artifactUploadDate(artifact) }}
                    </span>
                    <code v-if="artifact.hash" class="mono artifact-hash" :title="artifact.hash">
                      {{ t('releases.artifact.checksum') }} {{ artifact.hash }}
                    </code>
                  </div>
                </li>
              </ul>
              <p v-else class="section-empty">
                {{ t('releasePage.noArtifacts') }}
              </p>

              <ProductAppStoreListings :slug="slug" class="store-listings" />
            </section>

            <a
              v-if="product?.repo"
              :href="product.repo"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm detail-source"
            >
              <CodeXml class="download-icon" aria-hidden="true" />
              {{ t('product.sourceCode') }}
            </a>
          </template>

          <div v-else class="section-empty">
            <p class="empty-title">{{ t('releases.noReleases') }}</p>
            <p>{{ loadFailed ? t('releasePage.loadFailed') : t('releasePage.emptyHint') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  padding-block: 1.75rem 2rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
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

.crumb.is-current {
  color: var(--color-dim);
}

.crumb-sep {
  color: var(--color-line);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.title-mark {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: var(--radius-mark);
  object-fit: cover;
  background: var(--color-base-300);
}

.title-copy {
  min-width: 0;
}

.title-series {
  margin: 0 0 0.15rem;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.title-name {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.title-name a {
  color: var(--color-base-content);
  text-decoration: none;
  transition: color 140ms ease;
}

.title-name a:hover {
  color: var(--color-primary);
}

.body {
  padding-block: 2rem 0;
}

.grid {
  display: grid;
  gap: 2rem;
}

.versions {
  display: flex;
  flex-direction: column;
}

.versions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.versions-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.versions-head {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  letter-spacing: 0.01em;
}

.head-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  color: var(--color-faint);
  flex-shrink: 0;
}

.versions-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: 0.35rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-300) 60%, transparent);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-dim);
}

.versions-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.version {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-chip, 12px);
  border: 0;
  background: transparent;
  color: inherit;
  text-decoration: none;
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

.version:hover {
  background: color-mix(in oklab, var(--color-base-300) 55%, transparent);
}

.version.is-current {
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
}

:global([data-theme="stargate-light"]) .version.is-current {
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.version-badge-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  min-width: 0;
}

.version-number {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-base-content);
  letter-spacing: -0.01em;
}

.version.is-current .version-number {
  color: var(--color-primary);
  font-weight: 700;
}

.version-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.02em;
  border: 0;
  color: var(--color-faint);
  background: color-mix(in oklab, var(--color-base-300) 60%, transparent);
}

.version-tag.is-latest {
  background: color-mix(in oklab, var(--color-primary) 20%, transparent);
  color: var(--color-primary);
}

.version-tag.is-prerelease {
  background: color-mix(in oklab, var(--color-warning) 20%, transparent);
  color: var(--color-warning);
}

.version-tag.is-expired {
  background: color-mix(in oklab, var(--color-error) 20%, transparent);
  color: var(--color-error);
}

.version-date {
  font-size: 0.6875rem;
  color: var(--color-faint);
  flex-shrink: 0;
}

.version.is-current .version-date {
  color: color-mix(in oklab, var(--color-primary) 65%, var(--color-faint));
}

.version-title {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.version.is-current .version-title {
  color: var(--color-base-content);
}

.versions-empty {
  margin: 0;
  padding: 1.5rem 0.75rem;
  border-radius: var(--radius-chip, 12px);
  border: 1px dashed var(--color-line-soft);
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.versions-back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.25rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-chip, 12px);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.versions-back:hover,
.versions-back:focus-visible {
  color: var(--color-base-content);
  background: color-mix(in oklab, var(--color-base-300) 45%, transparent);
}

.versions-back:hover .back-icon {
  transform: translateX(-2px);
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform 140ms ease;
}

.detail {
  min-width: 0;
}

.detail-version {
  margin: 0;
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 500;
  color: var(--color-base-content);
  word-break: break-word;
}

.detail-title {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--color-dim);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.85rem;
}

.detail-status {
  color: var(--color-faint);
}

.detail-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 1.25rem 0 0;
}

.fact dt {
  font-size: 0.75rem;
  color: var(--color-faint);
}

.fact dd {
  margin: 0.15rem 0 0;
  color: var(--color-dim);
}

.detail-section {
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-line-soft);
}

.section-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
}

.section-head-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.section-count {
  color: var(--color-faint);
}

.section-empty {
  margin: 0.9rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.empty-title {
  margin-bottom: 0.3rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.expired-note {
  margin-top: 0.9rem;
}

.artifacts {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  border-radius: var(--radius-card, 16px);
  border: 1px solid var(--color-line-soft);
  background: color-mix(in oklab, var(--color-base-200) 40%, transparent);
  overflow: hidden;
}

.artifact {
  padding: 0.85rem 1.125rem;
  border-bottom: 1px solid var(--color-line-soft);
  transition: background-color 140ms ease;
}

.artifact:last-child {
  border-bottom: 0;
}

.artifact:hover {
  background: color-mix(in oklab, var(--color-base-300) 35%, transparent);
}

.artifact-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.85rem;
}

.artifact-platform {
  color: var(--color-base-content);
  font-size: 0.8125rem;
  font-weight: 600;
  min-width: 4.5rem;
}

.artifact-arch {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: color-mix(in oklab, var(--color-base-300) 60%, transparent);
  color: var(--color-dim);
  font-size: 0.6875rem;
  text-transform: lowercase;
}

.artifact-file {
  min-width: 0;
  flex: 1 1 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  color: var(--color-dim);
}

.artifact-size {
  color: var(--color-faint);
  font-size: 0.75rem;
  margin-left: auto;
}

.artifact-download {
  flex-shrink: 0;
  border-radius: 9999px;
}

.download-icon {
  width: 0.8125rem;
  height: 0.8125rem;
}

.artifact-expired {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-error);
}

.artifact-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
  margin-top: 0.4rem;
  padding-left: 0.1rem;
  color: var(--color-faint);
  font-size: 0.6875rem;
}

.artifact-hash {
  overflow-wrap: anywhere;
}

.store-listings {
  margin-top: 2rem;
}

.detail-source {
  margin-top: 2rem;
}

.release-notes {
  margin-top: 1rem;
  max-width: 42rem;
}

.release-notes :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: 17rem minmax(0, 1fr);
    gap: 3.5rem;
  }

  .versions {
    position: sticky;
    top: calc(var(--site-page-offset) + 1.5rem);
    align-self: start;
    max-height: calc(100dvh - var(--site-page-offset) - 3rem);
    overflow-y: auto;
  }
}
</style>
