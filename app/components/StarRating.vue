<script setup lang="ts">
import { computed } from "vue"
import { Star, StarHalf } from "@lucide/vue"

interface Props {
  modelValue?: number
  size?: "xs" | "sm" | "md" | "lg"
  interactive?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  size: "sm",
  interactive: false,
  readonly: true,
})

const emit = defineEmits<{
  "update:modelValue": [value: number]
}>()

const starSize = computed(() => {
  switch (props.size) {
    case "xs": return "w-3 h-3"
    case "sm": return "w-4 h-4"
    case "md": return "w-5 h-5"
    case "lg": return "w-7 h-7"
    default: return "w-4 h-4"
  }
})

const stars = computed(() => {
  const full = Math.floor(props.modelValue)
  const half = props.modelValue - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return { full, half, empty }
})

function setRating(value: number) {
  if (props.interactive && !props.readonly) {
    emit("update:modelValue", value)
  }
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <!-- Full stars -->
    <button
      v-for="i in stars.full"
      :key="`full-${i}`"
      type="button"
      :class="[
        starSize,
        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default',
        'text-warning',
      ]"
      :disabled="!interactive"
      @click="setRating(i)"
    >
      <Star class="fill-warning" />
    </button>

    <!-- Half star -->
    <button
      v-if="stars.half"
      key="half"
      type="button"
      :class="[
        starSize,
        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default',
      ]"
      :disabled="!interactive"
      @click="setRating(stars.full + 1)"
    >
      <StarHalf class="text-warning fill-warning/50" />
    </button>

    <!-- Empty stars -->
    <button
      v-for="i in stars.empty"
      :key="`empty-${i}`"
      type="button"
      :class="[
        starSize,
        interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default',
        'text-base-300',
      ]"
      :disabled="!interactive"
      @click="setRating(stars.full + stars.half + i)"
    >
      <Star />
    </button>
  </div>
</template>
