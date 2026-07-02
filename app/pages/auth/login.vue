<script setup lang="ts">
import { CircleUser, ArrowRight } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const auth = useAuth()

const isLoading = ref(false)
const error = ref('')

async function handleSolianSignIn() {
  error.value = ''
  isLoading.value = true
  console.log('[Login] Attempting Solian sign in')
  const { error: signInError } = await auth.signIn.social({
    provider: 'solian',
    callbackURL: localePath('/auth/profile'),
  })
  console.log('[Login] Solian sign in result:', signInError ? 'error' : 'success')
  if (signInError) {
    console.log('[Login] Solian sign in error:', signInError)
  }
  isLoading.value = false
  if (signInError) {
    error.value = signInError.message || 'Sign in failed'
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-200px)] items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <CircleUser class="mx-auto mb-3 w-12 h-12 text-base-content/30" />
        <h1 class="text-2xl font-bold">
          {{ t('login.title', 'Sign in') }}
        </h1>
        <p class="mt-1 text-sm text-base-content/60">
          {{ t('login.subtitle', 'Welcome back') }}
        </p>
      </div>

      <button
        class="btn btn-primary w-full gap-2 rounded-xl"
        :disabled="isLoading"
        @click="handleSolianSignIn"
      >
        <img src="/favicon.png" alt="Solian" class="w-5 h-5 rounded-full">
        <span v-if="isLoading" class="loading loading-spinner loading-sm" />
        <template v-else>
          {{ t('login.solian', 'Continue with Solarpass') }}
          <ArrowRight class="w-4 h-4" />
        </template>
      </button>

      <p v-if="error" class="mt-4 text-sm text-error text-center">{{ error }}</p>
    </div>
  </div>
</template>
