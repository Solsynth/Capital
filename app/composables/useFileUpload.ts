export interface UploadedFile {
  id: string
  key: string
  name: string
  mimeType: string
  size: number
  url: string
}

export interface UseFileUploadOptions {
  folder?: string
  maxSize?: number // bytes
  allowedTypes?: string[]
  onSuccess?: (file: UploadedFile) => void
  onError?: (error: Error) => void
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    folder = 'uploads',
    maxSize = 5 * 1024 * 1024,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    onSuccess,
    onError,
  } = options

  const isUploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)
  const uploadedFile = ref<UploadedFile | null>(null)

  function validateFile(file: File): string | null {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`
    }
    if (file.size > maxSize) {
      return `File too large. Max size: ${maxSize / 1024 / 1024}MB`
    }
    return null
  }

  async function upload(file: File): Promise<UploadedFile | null> {
    error.value = null
    progress.value = 0

    // Validate
    const validationError = validateFile(file)
    if (validationError) {
      error.value = validationError
      onError?.(new Error(validationError))
      return null
    }

    isUploading.value = true

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Simulate progress (real progress tracking would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += 10
        }
      }, 100)

      const result = await $fetch<UploadedFile>('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      progress.value = 100

      uploadedFile.value = result
      onSuccess?.(result)
      return result
    }
    catch (e: any) {
      const message = e.data?.statusMessage || e.message || 'Upload failed'
      error.value = message
      onError?.(new Error(message))
      return null
    }
    finally {
      isUploading.value = false
    }
  }

  function reset() {
    isUploading.value = false
    progress.value = 0
    error.value = null
    uploadedFile.value = null
  }

  return {
    upload,
    reset,
    isUploading: readonly(isUploading),
    progress: readonly(progress),
    error: readonly(error),
    uploadedFile: readonly(uploadedFile),
  }
}
