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
      <DialogOverlay class="scrim" />
      <DialogContent
        class="sheet"
        :class="maxWidth"
        @pointer-down-outside="(event: any) => {
          const target = event.detail.originalEvent.target as HTMLElement
          if (target?.closest('[data-toast-viewport]')) event.preventDefault()
        }"
      >
        <div v-if="title || $slots.header" class="sheet-head">
          <div class="min-w-0">
            <DialogTitle v-if="title" class="sheet-title">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="sheet-subtitle">
              {{ description }}
            </DialogDescription>
            <slot name="header" />
          </div>
          <DialogClose as-child>
            <button
              class="btn btn-ghost btn-sm btn-square close"
              :aria-label="$t('common.close', 'Close')"
            >
              ✕
            </button>
          </DialogClose>
        </div>

        <div class="sheet-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="sheet-foot">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: color-mix(in oklab, #141316 68%, transparent);
  backdrop-filter: blur(3px);
}

.sheet {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 50;
  width: calc(100% - 2rem);
  max-height: calc(100dvh - 3rem);
  overflow-y: auto;
  padding: 1.25rem 1.375rem 1.375rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sheet);
  background: var(--color-base-200);
  transform: translate(-50%, -50%);
  outline: none;
}

.sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.sheet-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.sheet-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-faint);
}

.close {
  margin-top: -0.15rem;
  margin-right: -0.35rem;
  flex-shrink: 0;
}

.sheet-body {
  margin-top: 1rem;
}

.sheet-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
</style>
