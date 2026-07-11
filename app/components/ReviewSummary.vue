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
  ].map((bar) => ({
    ...bar,
    pct: Math.min(100, (bar.count / total) * 100),
  }))
})
</script>

<template>
  <div class="w-full">
    <div class="flex items-center gap-5 mb-5">
      <div class="flex flex-col items-center shrink-0 min-w-16">
        <span class="text-4xl font-bold leading-none tabular-nums tracking-tight">
          {{ averageValue.toFixed(1) }}
        </span>
        <StarRating
          :model-value="averageValue"
          size="sm"
          readonly
          class="my-1.5"
        />
        <span class="text-xs opacity-50 text-center">
          {{ t("reviews.summary.count", { count: countValue }) }}
        </span>
      </div>

      <div class="flex-1 space-y-1.5 min-w-0">
        <div
          v-for="bar in distributionBars"
          :key="bar.star"
          class="flex items-center gap-2"
        >
          <span class="text-xs opacity-50 w-3 text-right tabular-nums">{{
            bar.star
          }}</span>
          <div class="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div
              class="h-full bg-warning rounded-full transition-all duration-300"
              :style="{ width: `${bar.pct}%` }"
            />
          </div>
          <span class="text-xs opacity-40 w-5 text-right tabular-nums">{{
            bar.count
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
