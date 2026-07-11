<script setup lang="ts">
import { ThumbsUp, ThumbsDown, User as UserIcon } from "@lucide/vue"
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

const { t, locale } = useI18n()

const emit = defineEmits<{
  helpful: [id: string]
}>()

const formattedDate = computed(() => {
  return new Date(props.createdAt).toLocaleDateString(
    locale.value === "zh" ? "zh-CN" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  )
})
</script>

<template>
  <article
    class="rounded-xl border border-base-content/5 bg-base-200 p-5 transition-colors hover:bg-base-300/40"
  >
    <div class="flex items-start gap-3">
      <div class="avatar placeholder shrink-0">
        <div v-if="userImage" class="w-9 h-9 rounded-full overflow-hidden">
          <img :src="userImage" :alt="userName" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          class="bg-base-300 text-base-content w-9 h-9 rounded-full flex items-center justify-center"
        >
          <UserIcon class="w-4 h-4 opacity-50" />
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-semibold text-sm truncate">{{
            userName || "Anonymous"
          }}</span>
          <time class="text-xs opacity-50 shrink-0">{{ formattedDate }}</time>
        </div>

        <div class="flex flex-wrap items-center gap-2 mb-2">
          <StarRating :model-value="rating" size="xs" readonly />
          <span
            v-if="isRecommended === true"
            class="badge badge-success badge-soft badge-xs gap-1"
          >
            <ThumbsUp class="w-2.5 h-2.5" />
            {{ t("reviews.recommended") }}
          </span>
          <span
            v-else-if="isRecommended === false"
            class="badge badge-ghost badge-xs gap-1"
          >
            <ThumbsDown class="w-2.5 h-2.5" />
            {{ t("reviews.notRecommended") }}
          </span>
        </div>

        <p v-if="title" class="font-medium text-sm mb-1">{{ title }}</p>
        <p
          v-if="content"
          class="text-sm opacity-75 leading-relaxed whitespace-pre-wrap"
        >
          {{ content }}
        </p>
      </div>
    </div>

    <div
      class="flex items-center gap-3 mt-4 pt-3 border-t border-base-content/5"
    >
      <button
        type="button"
        class="btn btn-ghost btn-xs gap-1.5 opacity-60 hover:opacity-100"
        @click="emit('helpful', id)"
      >
        <ThumbsUp class="w-3 h-3" />
        <span>{{ t("reviews.helpful") }}</span>
      </button>
      <span v-if="helpfulCount > 0" class="text-xs opacity-45">
        {{ t("reviews.helpfulCount", { count: helpfulCount }) }}
      </span>
    </div>
  </article>
</template>
