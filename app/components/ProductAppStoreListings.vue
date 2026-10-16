<script setup lang="ts">
import { APP_STORE_AVAILABILITY, appStoreBadgeSrc } from "~/utils/appStore"

const props = defineProps<{ slug: string }>()

const { t, locale } = useI18n()

const listings = computed(() => {
  const availability = APP_STORE_AVAILABILITY[props.slug]
  if (!availability) return []
  return [availability.ios, availability.macos].filter(Boolean).map((listing) => ({
    url: listing.url,
    label: t(listing.labelKey),
    notice: listing.noticeKey ? t(listing.noticeKey) : null,
    src: appStoreBadgeSrc(listing, locale.value),
  }))
})

/** Listings can share a caveat (one storefront constraint), so each is stated once. */
const uniqueNotices = computed(() => [...new Set(listings.value.map((listing) => listing.notice).filter(Boolean))])
</script>

<template>
  <div v-if="listings.length">
    <p class="store-label">{{ t("productDownloadsCta.appStore") }}</p>
    <div class="mt-3.5 flex flex-wrap items-start gap-6">
      <div v-for="listing in listings" :key="listing.label" class="max-w-xs">
        <a
          :href="listing.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="listing.label"
          class="inline-flex rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <img
            :src="listing.src.light"
            :alt="listing.label"
            :width="listing.src.width"
            :height="listing.src.height"
            class="store-badge app-store-badge-light"
          />
          <img
            :src="listing.src.dark"
            :alt="listing.label"
            :width="listing.src.width"
            :height="listing.src.height"
            class="store-badge app-store-badge-dark"
          />
        </a>
      </div>
    </div>
    <p v-for="notice in uniqueNotices" :key="notice" class="mt-3 max-w-2xl text-xs leading-relaxed opacity-60">
      {{ notice }}
    </p>
  </div>
</template>

<style scoped>
.store-label {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  opacity: 0.5;
}

/* Display is owned by the unscoped theme block below; this only sizes the badge. */
.store-badge {
  height: 2.75rem;
  width: auto;
}
</style>

<!--
  Not scoped: a theme-toggled descendant rule loses the descendant half under Vue's scoped-CSS
  transformation, and `!important` cannot be used because these images also carry `hidden`.
  The class names are unique to this component.
-->
<style>
.app-store-badge-light {
  display: block;
}

.app-store-badge-dark {
  display: none;
}

[data-theme="dark"] .app-store-badge-light {
  display: none;
}

[data-theme="dark"] .app-store-badge-dark {
  display: block;
}
</style>
