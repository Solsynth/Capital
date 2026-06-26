<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  description?: string
  maxWidth?: string
}>(), {
  maxWidth: 'max-w-lg',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
      <DialogContent
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100-2rem)] rounded-2xl border border-base-content/10 bg-base-100 p-6 shadow-2xl focus:outline-none"
        :class="maxWidth"
        @pointer-down-outside="(event: any) => {
          const target = event.detail.originalEvent.target as HTMLElement
          if (target?.closest('[data-toast-viewport]')) event.preventDefault()
        }"
      >
        <div v-if="title || $slots.header" class="flex items-start justify-between mb-4">
          <div>
            <DialogTitle v-if="title" class="text-lg font-bold">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="text-sm opacity-60 mt-0.5">
              {{ description }}
            </DialogDescription>
            <slot name="header" />
          </div>
          <DialogClose as-child>
            <button class="btn btn-ghost btn-sm btn-circle -mt-1 -mr-1">
              ✕
            </button>
          </DialogClose>
        </div>

        <slot />

        <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
