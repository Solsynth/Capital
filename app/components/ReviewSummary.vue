<script setup lang="ts">
import StarRating from "./StarRating.vue"

interface Props {
  average?: number
  count?: number
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

const distributionBars = computed(() => {
  const d = props.distribution
  const max = Math.max(d.fiveStar, d.fourStar, d.threeStar, d.twoStar, d.oneStar, 1)
  return [
    { star: 5, count: d.fiveStar, pct: (d.fiveStar / max) * 100 },
    { star: 4, count: d.fourStar, pct: (d.fourStar / max) * 100 },
    { star: 3, count: d.threeStar, pct: (d.threeStar / max) * 100 },
    { star: 2, count: d.twoStar, pct: (d.twoStar / max) * 100 },
    { star: 1, count: d.oneStar, pct: (d.oneStar / max) * 100 },
  ]
})
</script>

<template>
  <div class="max-w-md bg-base-200/50 rounded-xl p-5">
    <div class="flex items-start gap-5">
      <div class="flex flex-col items-center shrink-0">
        <span class="text-4xl font-bold leading-none tabular-nums">
          {{ Number(average ?? 0).toFixed(1) }}
        </span>
        <StarRating :model-value="average" size="sm" readonly class="my-1.5" />
        <span class="text-xs opacity-50">
          {{ count }} {{ count === 1 ? "review" : "reviews" }}
        </span>
      </div>

      <div class="flex-1 space-y-1 min-w-0">
        <div
          v-for="bar in distributionBars"
          :key="bar.star"
          class="flex items-center gap-1.5"
        >
          <span class="text-xs opacity-50 w-3 text-right tabular-nums">{{ bar.star }}</span>
          <div class="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
            <div
              class="h-full bg-warning rounded-full transition-all duration-500"
              :style="{ width: `${bar.pct}%` }"
            />
          </div>
          <span class="text-xs opacity-40 w-5 text-right tabular-nums">{{ bar.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
