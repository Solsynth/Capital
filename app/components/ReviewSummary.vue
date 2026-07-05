<script setup lang="ts">
import { Star } from "@lucide/vue"
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
  <div class="card bg-base-100 border border-base-200">
    <div class="card-body p-6">
      <h3 class="card-title text-lg mb-4">{{ t("reviews.title") }}</h3>

      <div v-if="count === 0" class="text-center py-4">
        <p class="opacity-60">{{ t("reviews.noReviews") }}</p>
      </div>

      <div v-else class="flex flex-col md:flex-row gap-6">
        <!-- Big average number -->
        <div class="flex flex-col items-center justify-center min-w-[120px]">
          <span class="text-5xl font-bold text-primary mb-1">
            {{ average.toFixed(1) }}
          </span>
          <StarRating :model-value="average" size="sm" readonly class="mb-1" />
          <span class="text-sm opacity-60">
            {{ t("reviews.summary.count", { count }) }}
          </span>
        </div>

        <!-- Distribution bars -->
        <div class="flex-1 space-y-1.5">
          <div
            v-for="bar in distributionBars"
            :key="bar.star"
            class="flex items-center gap-2"
          >
            <span class="text-xs opacity-60 w-8 text-right">{{ bar.star }}★</span>
            <div class="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-warning rounded-full transition-all duration-300"
                :style="{ width: `${bar.pct}%` }"
              />
            </div>
            <span class="text-xs opacity-50 w-6 text-right">{{ bar.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
