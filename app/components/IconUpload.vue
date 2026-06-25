<script setup lang="ts">
import { Upload, X, Image } from '@lucide/vue'

const props = defineProps<{
  currentIcon?: string | null
  folder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  uploaded: [fileId: string, url: string]
  removed: []
}>()

const { locale } = useI18n()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

const isUploading = ref(false)
const error = ref<string | null>(null)
const previewUrl = ref<string | null>(props.currentIcon || null)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.currentIcon, (val) => {
  previewUrl.value = val || null
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    error.value = isZh.value ? '不支持的文件类型' : 'Unsupported file type'
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = isZh.value ? '文件太大（最大 5MB）' : 'File too large (max 5MB)'
    return
  }

  isUploading.value = true
  error.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', props.folder || 'uploads')

    const result = await $fetch<{ id: string; url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })

    previewUrl.value = result.url
    emit('uploaded', result.id, result.url)
  }
  catch (err: any) {
    error.value = err.data?.statusMessage || (isZh.value ? '上传失败' : 'Upload failed')
  }
  finally {
    isUploading.value = false
    // Reset input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function handleRemove() {
  previewUrl.value = null
  emit('removed')
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div
      class="relative w-16 h-16 rounded-xl overflow-hidden bg-base-200 flex items-center justify-center cursor-pointer group"
      :class="{ 'opacity-50': disabled }"
      @click="!disabled && triggerFileInput()"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        class="w-full h-full object-cover"
      >
      <Image v-else class="w-6 h-6 opacity-40" />
      
      <!-- Upload overlay -->
      <div
        v-if="!disabled"
        class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Upload class="w-5 h-5 text-white" />
      </div>

      <!-- Loading overlay -->
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <span class="loading loading-spinner loading-sm text-white" />
      </div>
    </div>

    <div class="flex-1">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      >
      
      <div class="flex gap-2">
        <button
          type="button"
          class="btn btn-sm btn-outline"
          :disabled="disabled || isUploading"
          @click="triggerFileInput()"
        >
          <Upload class="w-3 h-3 mr-1" />
          {{ isZh ? '上传图标' : 'Upload Icon' }}
        </button>
        <button
          v-if="previewUrl"
          type="button"
          class="btn btn-sm btn-ghost text-error"
          :disabled="disabled"
          @click="handleRemove()"
        >
          <X class="w-3 h-3 mr-1" />
          {{ isZh ? '移除' : 'Remove' }}
        </button>
      </div>

      <p v-if="error" class="text-xs text-error mt-1">{{ error }}</p>
      <p v-else class="text-xs opacity-50 mt-1">
        {{ isZh ? '支持 JPG, PNG, GIF, WebP, SVG（最大 5MB）' : 'Supports JPG, PNG, GIF, WebP, SVG (max 5MB)' }}
      </p>
    </div>
  </div>
</template>
