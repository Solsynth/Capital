<script setup lang="ts">
import { CircleUser, ArrowRight } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const auth = useAuth()

const isLoading = ref(false)
const error = ref('')

useSeoMeta({
  title: () => t('login.title'),
  description: () => t('login.subtitle'),
})

async function handleSolianSignIn() {
  error.value = ''
  isLoading.value = true
  const { error: signInError } = await auth.signIn.social({
    provider: 'solian',
    callbackURL: localePath('/auth/profile'),
  })
  isLoading.value = false
  if (signInError) {
    error.value = signInError.message || 'Sign in failed'
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-12rem)] items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-base-200 bg-base-200/50">
          <CircleUser class="h-7 w-7 text-base-content/40" />
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">
          {{ t('login.title') }}
        </h1>
        <p class="mt-2 text-sm text-base-content/60">
          {{ t('login.subtitle') }}
        </p>
      </div>

      <div class="rounded-lg border border-base-200 bg-base-100 p-5">
        <button
          type="button"
          class="btn btn-primary w-full gap-2"
          :disabled="isLoading"
          @click="handleSolianSignIn"
        >
          <img
            src="/favicon-64.png"
            alt=""
            class="h-5 w-5 rounded"
          >
          <span
            v-if="isLoading"
            class="loading loading-spinner loading-sm"
          />
          <template v-else>
            {{ t('login.solian') }}
            <ArrowRight class="h-4 w-4" />
          </template>
        </button>

        <p
          v-if="error"
          class="mt-4 text-center text-sm text-error"
        >
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
