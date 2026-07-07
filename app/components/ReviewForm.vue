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
      <DialogOverlay class="bg-black/50 fixed inset-0 z-50 backdrop-blur-sm" />
      <DialogContent
        class="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-base-100 rounded-2xl shadow-2xl border border-base-200 p-0 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle class="text-lg font-bold">
            {{ existingReview ? t("reviews.editReview") : t("reviews.writeReview") }}
          </DialogTitle>
          <DialogClose class="btn btn-ghost btn-square btn-sm">
            <X class="w-4 h-4" />
          </DialogClose>
        </div>

        <DialogDescription class="px-6 pb-4 text-sm opacity-60">
          {{ t("reviews.shareExperience") }}
        </DialogDescription>

        <!-- Form -->
        <form class="px-6 pb-6 space-y-5" @submit.prevent="emit('submit')">
          <!-- Rating -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t("reviews.yourRating") }}</legend>
            <div class="flex items-center gap-3">
              <StarRating
                :model-value="form.rating"
                size="lg"
                interactive
                :readonly="false"
                @update:model-value="setRating"
              />
              <span v-if="form.rating > 0" class="text-sm font-medium opacity-70">
                {{ form.rating }}/5
              </span>
            </div>
          </fieldset>

          <!-- Recommended -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t("reviews.recommend") }}</legend>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn btn-sm min-w-[80px]"
                :class="form.isRecommended === true ? 'btn-primary' : 'btn-ghost'"
                @click="emit('update:modelValue', { ...form, isRecommended: true })"
              >
                {{ t("yes") }}
              </button>
              <button
                type="button"
                class="btn btn-sm min-w-[80px]"
                :class="form.isRecommended === false ? 'btn-primary' : 'btn-ghost'"
                @click="emit('update:modelValue', { ...form, isRecommended: false })"
              >
                {{ t("no") }}
              </button>
            </div>
          </fieldset>

          <!-- Title -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t("reviews.title_label") }}</legend>
            <input
              v-model="form.title"
              type="text"
              :placeholder="t('reviews.title_placeholder')"
              class="input input-bordered w-full"
            />
          </fieldset>

          <!-- Content -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t("reviews.content_label") }}</legend>
            <textarea
              v-model="form.content"
              :placeholder="t('reviews.content_placeholder')"
              class="textarea textarea-bordered w-full h-28"
            />
          </fieldset>

          <!-- Actions -->
          <div class="flex gap-2 justify-end pt-2">
            <button
              v-if="existingReview"
              type="button"
              class="btn btn-ghost btn-sm text-error"
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
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="form.rating === 0 || submitting"
            >
              {{ submitting ? "..." : existingReview ? t("reviews.update") : t("reviews.submit") }}
            </button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
