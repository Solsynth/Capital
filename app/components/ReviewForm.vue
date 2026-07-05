<script setup lang="ts">
import { computed } from "vue"
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
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
  existingReview: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: { rating: number; title: string; content: string; isRecommended: boolean | null }]
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
  <div class="card bg-base-100 border border-base-200">
    <div class="card-body p-6">
      <h3 class="card-title text-lg mb-4">
        {{ existingReview ? t("reviews.editReview") : t("reviews.writeReview") }}
      </h3>

      <!-- Rating -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t("reviews.yourRating") }}</span>
          <span v-if="form.rating > 0" class="label-text-alt">
            {{ form.rating }}/5
          </span>
        </label>
        <StarRating
          :model-value="form.rating"
          size="lg"
          interactive
          @update:model-value="setRating"
        />
      </div>

      <!-- Recommended -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">Recommend this product?</span>
        </label>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-sm"
            :class="form.isRecommended === true ? 'btn-success' : 'btn-outline'"
            @click="emit('update:modelValue', { ...form, isRecommended: true })"
          >
            Yes
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="form.isRecommended === false ? 'btn-error' : 'btn-outline'"
            @click="emit('update:modelValue', { ...form, isRecommended: false })"
          >
            No
          </button>
        </div>
      </div>

      <!-- Title -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t("reviews.title_label") }}</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          :placeholder="t('reviews.title_label')"
          class="input input-bordered input-sm"
        />
      </div>

      <!-- Content -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t("reviews.content_label") }}</span>
        </label>
        <textarea
          v-model="form.content"
          :placeholder="t('reviews.content_label')"
          class="textarea textarea-bordered h-24"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-2 justify-end">
        <button
          v-if="existingReview"
          type="button"
          class="btn btn-ghost btn-sm text-error"
          :disabled="submitting"
          @click="emit('delete')"
        >
          {{ t("reviews.delete") }}
        </button>
        <button
          v-if="existingReview"
          type="button"
          class="btn btn-ghost btn-sm"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="form.rating === 0 || submitting"
          @click="emit('submit')"
        >
          {{ submitting ? "..." : existingReview ? t("reviews.update") : t("reviews.submit") }}
        </button>
      </div>
    </div>
  </div>
</template>
