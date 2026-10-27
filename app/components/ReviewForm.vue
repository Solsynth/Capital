<script setup lang="ts">
import { computed } from "vue"
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
} from "reka-ui"
import { X } from "@lucide/vue"
import StarRating from "./StarRating.vue"

interface Props {
  modelValue?: {
    rating: number
    title: string
    content: string
    isRecommended: boolean | null
  }
  submitting?: boolean
  existingReview?: boolean
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
  existingReview: false,
  open: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: { rating: number; title: string; content: string; isRecommended: boolean | null }]
  "update:open": [value: boolean]
  submit: []
  cancel: []
  delete: []
}>()

const { t } = useI18n()

const form = computed({
  get: () => props.modelValue ?? { rating: 0, title: "", content: "", isRecommended: null },
  set: (val) => emit("update:modelValue", val),
})

function setRating(value: number) {
  emit("update:modelValue", { ...form.value, rating: value })
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="dialog-scrim" />
      <DialogContent class="dialog-panel">
        <header class="dialog-head">
          <div>
            <DialogTitle class="dialog-title">
              {{ existingReview ? t("reviews.editReview") : t("reviews.writeReview") }}
            </DialogTitle>
            <DialogDescription class="dialog-desc">
              {{ t("reviews.shareExperience") }}
            </DialogDescription>
          </div>
          <DialogClose class="btn btn-ghost btn-sm px-2" :aria-label="t('common.close')">
            <X class="h-4 w-4" />
          </DialogClose>
        </header>

        <form class="dialog-body" @submit.prevent="emit('submit')">
          <div class="field">
            <span class="field-label">{{ t("reviews.yourRating") }}</span>
            <div class="rating-row">
              <StarRating
                :model-value="form.rating"
                size="lg"
                interactive
                :readonly="false"
                @update:model-value="setRating"
              />
              <span v-if="form.rating > 0" class="mono rating-value">{{ form.rating }}/5</span>
            </div>
          </div>

          <div class="field">
            <span class="field-label">{{ t("reviews.recommend") }}</span>
            <div class="verdict-row">
              <button
                type="button"
                class="chip verdict-chip"
                :class="{ 'is-current': form.isRecommended === true }"
                :aria-pressed="form.isRecommended === true"
                @click="emit('update:modelValue', { ...form, isRecommended: true })"
              >
                {{ t("yes") }}
              </button>
              <button
                type="button"
                class="chip verdict-chip"
                :class="{ 'is-current': form.isRecommended === false }"
                :aria-pressed="form.isRecommended === false"
                @click="emit('update:modelValue', { ...form, isRecommended: false })"
              >
                {{ t("no") }}
              </button>
            </div>
          </div>

          <label class="field">
            <span class="field-label">{{ t("reviews.title_label") }}</span>
            <input
              v-model="form.title"
              type="text"
              :placeholder="t('reviews.title_placeholder')"
              class="input"
            >
          </label>

          <label class="field">
            <span class="field-label">{{ t("reviews.content_label") }}</span>
            <textarea
              v-model="form.content"
              :placeholder="t('reviews.content_placeholder')"
              class="textarea h-28"
            />
          </label>

          <div class="dialog-actions">
            <button
              v-if="existingReview"
              type="button"
              class="btn btn-ghost btn-sm dialog-delete"
              :disabled="submitting"
              @click="emit('delete')"
            >
              {{ t("reviews.delete") }}
            </button>
            <DialogClose as-child>
              <button
                v-if="existingReview"
                type="button"
                class="btn btn-ghost btn-sm"
              >
                {{ t("common.cancel") }}
              </button>
            </DialogClose>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="form.rating === 0 || submitting"
            >
              {{ existingReview ? t("reviews.update") : t("reviews.submit") }}
            </button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--color-base-100) 55%, transparent);
  backdrop-filter: blur(3px);
}

.dialog-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 50;
  width: calc(100% - 2rem);
  max-width: 28rem;
  transform: translate(-50%, -50%);
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sheet);
  background: var(--color-base-200);
  box-shadow: 0 24px 60px -40px rgb(0 0 0 / 0.6);
}

.dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.dialog-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dialog-desc {
  margin-top: 0.2rem;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.field {
  display: block;
  margin: 0;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-value {
  color: var(--color-faint);
}

.verdict-row {
  display: flex;
  gap: 0.4rem;
}

.verdict-chip {
  min-width: 4rem;
  justify-content: center;
  padding-block: 0.35rem;
  font-size: 0.8125rem;
  cursor: pointer;
}

.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-line-soft);
}

.dialog-delete {
  margin-right: auto;
  color: var(--color-error);
}
</style>
