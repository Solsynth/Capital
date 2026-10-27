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

const { t, locale } = useI18n()

const emit = defineEmits<{
  helpful: [id: string]
}>()

const formattedDate = computed(() =>
  new Intl.DateTimeFormat(locale.value === "zh" ? "zh-CN" : "en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(props.createdAt)),
)
</script>

<template>
  <article class="review">
    <header class="review-head">
      <span v-if="userImage" class="review-avatar">
        <img :src="userImage" :alt="''" loading="lazy" decoding="async">
      </span>
      <span v-else class="review-avatar review-avatar-empty" aria-hidden="true">
        <UserIcon class="avatar-glyph" />
      </span>

      <div class="review-ident">
        <span class="review-name">{{ userName || t('reviews.anonymous') }}</span>
        <span class="review-meta">
          <StarRating :model-value="rating" size="xs" readonly />
          <span v-if="isRecommended === true" class="review-verdict is-yes">{{ t("reviews.recommended") }}</span>
          <span v-else-if="isRecommended === false" class="review-verdict">{{ t("reviews.notRecommended") }}</span>
        </span>
      </div>

      <time class="mono review-date" :datetime="String(createdAt)">{{ formattedDate }}</time>
    </header>

    <h3 v-if="title" class="review-title">
      {{ title }}
    </h3>
    <p v-if="content" class="review-body">
      {{ content }}
    </p>

    <footer class="review-foot">
      <button type="button" class="review-helpful" @click="emit('helpful', id)">
        <ThumbsUp class="helpful-icon" aria-hidden="true" />
        {{ t("reviews.helpful") }}
      </button>
      <span v-if="helpfulCount > 0" class="review-helpful-count">
        {{ t("reviews.helpfulCount", { count: helpfulCount }) }}
      </span>
    </footer>
  </article>
</template>

<style scoped>
.review {
  padding-block: 1.15rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.review-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.review-avatar {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-base-300);
}

.review-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-glyph {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-faint);
}

.review-ident {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.review-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.review-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.review-verdict {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-faint);
}

.review-verdict.is-yes {
  color: var(--color-success);
}

.review-date {
  margin-left: auto;
  color: var(--color-faint);
}

.review-title {
  margin: 0.75rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
}

.review-body {
  margin: 0.35rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
  white-space: pre-wrap;
}

.review-foot {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.7rem;
}

.review-helpful {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 140ms ease;
}

.review-helpful:hover,
.review-helpful:focus-visible {
  color: var(--color-primary);
}

.review-helpful:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: 2px;
}

.helpful-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.review-helpful-count {
  font-size: 0.75rem;
  color: var(--color-faint);
}
</style>
