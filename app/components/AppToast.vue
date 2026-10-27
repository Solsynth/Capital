<script setup lang="ts">
import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from 'reka-ui'

const toasts = ref<Array<{ id: number; title?: string; message: string; type: 'success' | 'error' | 'info' }>>([])
let nextId = 0

function addToast(opts: { title?: string; message: string; type?: 'success' | 'error' | 'info' }) {
  const id = nextId++
  toasts.value.push({ id, title: opts.title, message: opts.message, type: opts.type ?? 'info' })
  setTimeout(() => removeToast(id), 5000)
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

provide('toast', { addToast })
</script>

<template>
  <ToastProvider swipe-direction="right">
    <slot />

    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      v-model:open="toast.open"
      class="toast"
      :class="`toast-${toast.type}`"
    >
      <div class="toast-body">
        <div class="toast-text">
          <ToastTitle v-if="toast.title" class="toast-title">
            {{ toast.title }}
          </ToastTitle>
          <ToastDescription class="toast-message">
            {{ toast.message }}
          </ToastDescription>
        </div>
        <ToastClose class="btn btn-ghost btn-xs btn-square toast-close">
          ✕
        </ToastClose>
      </div>
    </ToastRoot>

    <ToastViewport class="viewport" />
  </ToastProvider>
</template>

<style scoped>
.viewport {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 9999;
  display: flex;
  width: max-content;
  max-width: 22rem;
  flex-direction: column;
  gap: 0.5rem;
  outline: none;
}

.toast {
  min-width: 16rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-base-200);
}

.toast-success {
  border-color: color-mix(in oklab, var(--color-success) 40%, transparent);
}

.toast-error {
  border-color: color-mix(in oklab, var(--color-error) 40%, transparent);
}

.toast-body {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 0.1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-base-content);
}

.toast-message {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-dim);
}

.toast-close {
  margin-top: -0.15rem;
  margin-right: -0.2rem;
  flex-shrink: 0;
  color: var(--color-faint);
}
</style>
