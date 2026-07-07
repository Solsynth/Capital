<script setup lang="ts">
import { ThumbsUp, User as UserIcon } from "@lucide/vue"
import StarRating from "./StarRating.vue"

interface Props {
  id: string
  userName?: string
  userImage?: string | null
  rating: number
  title?: string | null
  content?: string
  helpfulCount?: number
  createdAt: Date | string
  isRecommended?: boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  content: "",
  helpfulCount: 0,
  isRecommended: null,
})

const { t } = useI18n()

const emit = defineEmits<{
  helpful: [id: string]
}>()

const formattedDate = computed(() => {
  return new Date(props.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
})
</script>

<template>
  <div class="card bg-base-100 border border-base-200 p-5">
    <div class="flex items-start gap-3 mb-3">
      <!-- User avatar -->
      <div class="avatar placeholder shrink-0">
        <div
          v-if="userImage"
          class="w-9 h-9 rounded-full"
        >
          <img :src="userImage" :alt="userName" class="rounded-full" />
        </div>
        <div
          v-else
          class="bg-base-200 text-base-content w-9 h-9 rounded-full flex items-center justify-center"
        >
          <UserIcon class="w-4 h-4 opacity-50" />
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-semibold text-sm">{{ userName || "Anonymous" }}</span>
          <span class="text-xs opacity-50">{{ formattedDate }}</span>
        </div>

        <div class="flex items-center gap-2 mb-2">
          <StarRating :model-value="rating" readonly />
          <span
            v-if="isRecommended === true"
            class="badge badge-success badge-xs gap-0.5"
          >
            <ThumbsUp class="w-2.5 h-2.5" />
            Recommended
          </span>
          <span
            v-else-if="isRecommended === false"
            class="badge badge-ghost badge-xs"
          >
            Not Recommended
          </span>
        </div>

        <p v-if="title" class="font-medium mb-1">{{ title }}</p>
        <p v-if="content" class="text-sm opacity-80 whitespace-pre-wrap">{{ content }}</p>
      </div>
    </div>

    <div class="flex items-center gap-3 pt-2 border-t border-base-200">
      <button
        class="btn btn-ghost btn-xs gap-1.5 opacity-60 hover:opacity-100"
        @click="emit('helpful', id)"
      >
        <ThumbsUp class="w-3 h-3" />
        <span class="text-xs">{{ t("reviews.helpful") }}</span>
      </button>
      <span class="text-xs opacity-50">
        {{ t("reviews.helpfulCount", { count: helpfulCount }) }}
      </span>
    </div>
  </div>
</template>
