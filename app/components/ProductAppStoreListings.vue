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
  <div v-if="listings.length" class="listings">
    <p class="listings-label">
      {{ t('productDownloadsCta.appStore') }}
    </p>
    <div class="listings-row">
      <a
        v-for="listing in listings"
        :key="listing.label"
        :href="listing.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="listing.label"
        class="listing-link"
      >
        <img
          :src="listing.src.light"
          :alt="listing.label"
          :width="listing.src.width"
          :height="listing.src.height"
          class="store-badge app-store-badge-light"
        >
        <img
          :src="listing.src.dark"
          :alt="listing.label"
          :width="listing.src.width"
          :height="listing.src.height"
          class="store-badge app-store-badge-dark"
        >
      </a>
    </div>
    <p v-for="notice in uniqueNotices" :key="notice" class="listings-note">
      {{ notice }}
    </p>
  </div>
</template>

<style scoped>
.listings-label {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.listings-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 0.75rem;
}

.listing-link {
  display: inline-flex;
  border-radius: var(--radius-mark);
}

.listing-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.store-badge {
  height: 2.5rem;
  width: auto;
}

.listings-note {
  margin: 0.6rem 0 0;
  max-width: 34rem;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--color-faint);
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

[data-theme='stargate'] .app-store-badge-light {
  display: none;
}

[data-theme='stargate'] .app-store-badge-dark {
  display: block;
}
</style>
