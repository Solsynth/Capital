<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

interface Props {
  slug: string
  title: string
  description: string
  icon: string
  background: string
  series?: string
  version?: string
  releasedDate?: string
  tags?: string[]
  averageRating?: number
  reviewCount?: number
  /** Wide preview for the catalog page; the homepage manifest omits it. */
  thumb?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  averageRating: 0,
  reviewCount: 0,
  thumb: false,
})

const { locale } = useI18n()
const localePath = useLocalePath()

const rating = computed(() => Number(props.averageRating) || 0)
const href = computed(() => localePath(`/products/${props.slug}`))

// A fixed-width stamp, so the date column lines up the way a ledger does.
function stamp(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const released = computed(() => stamp(props.releasedDate))
</script>

<template>
  <li class="row">
    <NuxtLink :to="href" class="row-link" :class="{ 'has-thumb': thumb }">
      <span v-if="thumb" class="row-thumb" aria-hidden="true">
        <NuxtImg
          :src="background"
          alt=""
          width="320"
          height="200"
          sizes="sm:160px"
          format="webp"
          loading="lazy"
          decoding="async"
          :style="{ viewTransitionName: `product-hero-${slug}` }"
        />
      </span>

      <span v-if="!thumb" class="row-mark">
        <NuxtImg
          :src="icon"
          alt=""
          width="32"
          height="32"
          format="webp"
          loading="lazy"
          decoding="async"
        />
      </span>

      <span class="row-ident">
        <span class="row-name">
          {{ title }}
          <ArrowUpRight class="row-arrow" aria-hidden="true" />
        </span>
        <span class="row-desc">{{ description }}</span>
        <span v-if="thumb && (tags.length || series)" class="row-tags">
          <span v-if="series" class="chip">{{ series }}</span>
          <span v-for="tag in tags.slice(0, 3)" :key="tag" class="chip">{{ tag }}</span>
        </span>
      </span>

      <span v-if="!thumb && series" class="row-series">{{ series }}</span>

      <span class="row-facts">
        <span v-if="rating > 0" class="mono row-rating">
          {{ rating.toFixed(1) }}
          <span class="row-count">{{ reviewCount }}</span>
        </span>
        <span v-if="version" class="mono row-version">v{{ version }}</span>
        <span v-if="released" class="mono row-date">{{ released }}</span>
      </span>
    </NuxtLink>
  </li>
</template>

<style scoped>
.row {
  border-bottom: 1px solid var(--color-line-soft);
}

.row-link {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  grid-template-areas:
    'mark ident'
    '.    facts';
  align-items: start;
  gap: 0.5rem 0.9rem;
  padding: 1rem 0.5rem 1rem 0;
  color: inherit;
  text-decoration: none;
  transition: background-color 140ms ease;
}

.row-link.has-thumb {
  grid-template-columns: minmax(0, 5.5rem) 1.75rem minmax(0, 1fr);
  grid-template-areas:
    'thumb mark ident'
    'thumb .    facts';
  gap: 0.75rem;
  padding-block: 1rem;
}

.row-link:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.row-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.row-thumb {
  grid-area: thumb;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: #fff;
}

.row-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-mark {
  grid-area: mark;
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: #fff;
}
.row-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.row-ident {
  grid-area: ident;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.row-name {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-base-content);
  letter-spacing: -0.005em;
}

.row-arrow {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-primary);
  opacity: 0;
  transition: opacity 140ms ease;
}

.row-link:hover .row-arrow,
.row-link:focus-visible .row-arrow {
  opacity: 1;
}

.row-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.row-series {
  grid-area: series;
  display: none;
}

.row-facts {
  grid-area: facts;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.35rem;
}

.row-rating {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  color: var(--color-warning);
}

.row-count {
  color: var(--color-faint);
  font-size: 0.6875rem;
}

.row-version {
  color: var(--color-dim);
}

.row-date {
  color: var(--color-faint);
}

@media (min-width: 768px) {
  .row-link {
    grid-template-columns: 2rem minmax(0, 1fr) 9rem 12rem;
    grid-template-areas: 'mark ident series facts';
    align-items: center;
    gap: 1.25rem;
    padding-block: 1.05rem;
  }



  .row-series {
    grid-area: series;
    display: block;
    font-size: 0.8125rem;
    color: var(--color-faint);
  }

  .row-facts {
    justify-content: flex-end;
    margin-top: 0;
  }

  .row-version {
    min-width: 3.5rem;
    text-align: right;
  }

}

/* Only a genuinely wide viewport has room for the preview; below it the row
   keeps the compact shape instead of pushing the name into a narrow column. */
@media (min-width: 1024px) {
  .row-link.has-thumb {
    grid-template-columns: 9rem minmax(0, 1fr) 12rem;
    grid-template-areas: 'thumb ident facts';
    gap: 1.25rem;
    align-items: center;
    padding-block: 1.25rem;
  }

  .row-link.has-thumb .row-facts {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.2rem;
  }
}
</style>
