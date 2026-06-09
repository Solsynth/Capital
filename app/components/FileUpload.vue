<script setup lang="ts">
import { Upload, X, Loader2 } from '@lucide/vue'
import type { UploadedFile } from '~/composables/useFileUpload'

interface Props {
  modelValue?: UploadedFile | null
  folder?: string
  maxSize?: number
  accept?: string
  disabled?: boolean
  compact?: boolean
  label?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  folder: 'uploads',
  maxSize: 5 * 1024 * 1024,
  accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
  disabled: false,
  compact: false,
  label: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [file: UploadedFile | null]
}>()

const { locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')

const { upload, isUploading, progress, error, reset } = useFileUpload({
  folder: props.folder,
  maxSize: props.maxSize,
  allowedTypes: props.accept.split(',').map(t => t.trim()),
})

const previewUrl = ref<string | null>(null)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Initialize preview from modelValue
watch(() => props.modelValue, (val) => {
  previewUrl.value = val?.url || null
}, { immediate: true })

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (props.disabled) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    processFile(input.files[0])
    input.value = '' // Reset so same file can be selected again
  }
}

async function processFile(file: File) {
  const result = await upload(file)
  if (result) {
    previewUrl.value = result.url
    emit('update:modelValue', result)
  }
}

function handleRemove() {
  previewUrl.value = null
  reset()
  emit('update:modelValue', null)
}

function triggerFileInput() {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" class="text-sm font-medium">
      {{ label }}
    </label>

    <!-- Upload area -->
    <div
      v-if="!previewUrl"
      class="relative border-2 border-dashed rounded-xl transition-colors cursor-pointer"
      :class="[
        isDragging ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        compact ? 'p-4' : 'p-8',
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :disabled="disabled"
        class="hidden"
        @change="handleFileSelect"
      >

      <div class="flex flex-col items-center gap-3 text-center">
        <div v-if="isUploading" class="flex flex-col items-center gap-2">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
          <p class="text-sm opacity-60">
            {{ isZh ? '上传中...' : 'Uploading...' }}
          </p>
          <progress class="progress progress-primary w-48" :value="progress" max="100" />
        </div>
        <template v-else>
          <Upload class="w-8 h-8 opacity-40" />
          <div>
            <p class="text-sm font-medium">
              {{ isZh ? '点击或拖拽上传图片' : 'Click or drag to upload image' }}
            </p>
            <p class="text-xs opacity-50 mt-1">
              {{ isZh ? `最大 ${maxSize / 1024 / 1024}MB` : `Max ${maxSize / 1024 / 1024}MB` }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <!-- Preview -->
    <div v-else class="relative group">
      <div
        class="rounded-xl overflow-hidden border border-base-300"
        :class="compact ? 'w-20 h-20' : 'w-full max-w-xs'"
      >
        <img
          :src="previewUrl"
          :alt="modelValue?.name || 'Uploaded image'"
          class="w-full h-full object-cover"
        >
      </div>
      <button
        v-if="!disabled"
        class="btn btn-circle btn-sm btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="handleRemove"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-error text-xs">
      {{ error }}
    </p>

    <!-- Hint -->
    <p v-if="hint && !error" class="text-xs opacity-50">
      {{ hint }}
    </p>
  </div>
</template>
