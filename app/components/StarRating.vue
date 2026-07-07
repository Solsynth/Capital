<script setup lang="ts">
import { computed, ref } from "vue"
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

const hoverRating = ref(0)

const starSize = computed(() => {
  switch (props.size) {
    case "xs": return "w-3 h-3"
    case "sm": return "w-4 h-4"
    case "md": return "w-5 h-5"
    case "lg": return "w-6 h-6"
    default: return "w-4 h-4"
  }
})

const displayRating = computed(() =>
  hoverRating.value > 0 ? hoverRating.value : props.modelValue
)

const stars = computed(() => {
  const val = displayRating.value
  const full = Math.floor(val)
  const half = val - full >= 0.5 ? 1 : 0
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
  <div class="flex items-center gap-1">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :class="[
        starSize,
        'p-0 flex items-center justify-center',
        interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default',
        i <= stars.full ? 'text-warning' : 'text-base-300',
      ]"
      :disabled="!interactive"
      :style="interactive ? 'outline: none' : ''"
      @click="setRating(i)"
      @mouseenter="interactive && (hoverRating = i)"
      @mouseleave="interactive && (hoverRating = 0)"
    >
      <Star
        v-if="i <= stars.full"
        class="fill-warning transition-colors"
        :class="starSize"
      />
      <StarHalf
        v-else-if="i === stars.full + 1 && stars.half"
        class="text-warning fill-warning/50"
        :class="starSize"
      />
      <Star
        v-else
        class="transition-colors"
        :class="[starSize, interactive && i <= hoverRating ? 'text-warning' : '']"
      />
    </button>
  </div>
</template>
