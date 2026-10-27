<script setup lang="ts">
import StarRating from "./StarRating.vue"

interface Props {
  average?: number | string
  count?: number | string
  distribution?: {
    fiveStar: number
    fourStar: number
    threeStar: number
    twoStar: number
    oneStar: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  average: 0,
  count: 0,
  distribution: () => ({
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  }),
})

const { t } = useI18n()

const averageValue = computed(() => Number(props.average) || 0)
const countValue = computed(() => Number(props.count) || 0)

const distributionBars = computed(() => {
  const d = props.distribution
  const total = countValue.value || 1
  return [
    { star: 5, count: Number(d.fiveStar) || 0 },
    { star: 4, count: Number(d.fourStar) || 0 },
    { star: 3, count: Number(d.threeStar) || 0 },
    { star: 2, count: Number(d.twoStar) || 0 },
    { star: 1, count: Number(d.oneStar) || 0 },
  ].map(bar => ({
    ...bar,
    pct: Math.min(100, (bar.count / total) * 100),
  }))
})
</script>

<template>
  <section class="summary" :aria-label="t('reviews.title')">
    <div class="score">
      <span class="score-figure">{{ averageValue.toFixed(1) }}</span>
      <StarRating :model-value="averageValue" size="sm" readonly class="score-stars" />
      <span class="score-count">{{ t("reviews.summary.count", { count: countValue }) }}</span>
    </div>

    <dl class="bars">
      <div v-for="bar in distributionBars" :key="bar.star" class="bar">
        <dt class="mono bar-star">{{ bar.star }}</dt>
        <dd class="bar-track">
          <span class="bar-fill" :style="{ width: `${bar.pct}%` }" />
          <span class="sr-only">{{ t("reviews.summary.distribution", { count: bar.count, star: bar.star }) }}</span>
        </dd>
        <dd class="mono bar-count">{{ bar.count }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem 2.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-card);
}

.score {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  min-width: 7rem;
}

.score-figure {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1;
  color: var(--color-base-content);
}

.score-stars {
  margin-block: 0.15rem;
}

.score-count {
  font-size: 0.75rem;
  color: var(--color-faint);
}

.bars {
  flex: 1;
  min-width: 11rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
}

.bar {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr) 2rem;
  align-items: center;
  gap: 0.6rem;
}

.bar-star {
  margin: 0;
  text-align: right;
  color: var(--color-faint);
}

.bar-track {
  position: relative;
  height: 4px;
  margin: 0;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-base-300);
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-warning);
}

.bar-count {
  margin: 0;
  text-align: right;
  color: var(--color-faint);
}
</style>
