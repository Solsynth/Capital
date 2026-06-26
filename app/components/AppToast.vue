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
      :class="[
        'card bg-base-100 border shadow-lg p-4 min-w-72 max-w-sm',
        toast.type === 'success' ? 'border-success/30' :
        toast.type === 'error' ? 'border-error/30' :
        'border-base-content/10',
      ]"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <ToastTitle v-if="toast.title" class="text-sm font-semibold mb-0.5">
            {{ toast.title }}
          </ToastTitle>
          <ToastDescription class="text-sm opacity-80">
            {{ toast.message }}
          </ToastDescription>
        </div>
        <ToastClose class="btn btn-ghost btn-xs btn-circle shrink-0 mt-0.5">
          ✕
        </ToastClose>
      </div>
    </ToastRoot>

    <ToastViewport class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-max max-w-sm outline-none" />
  </ToastProvider>
</template>
