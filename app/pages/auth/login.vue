<script setup lang="ts">
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
  <div class="page">
    <div class="sheet">
      <img src="/favicon.png" alt="" class="brand-mark mark" width="40" height="40">

      <h1 class="title page-title">
        {{ t('login.title') }}
      </h1>
      <p class="page-lede">
        {{ t('login.subtitle') }}
      </p>

      <p v-if="error" class="note note-error">
        {{ error }}
      </p>

      <button
        type="button"
        class="btn btn-primary login-button"
        :disabled="isLoading"
        @click="handleSolianSignIn"
      >
        <img
          src="/favicon-64.png"
          alt=""
          class="btn-mark"
        >
        <span v-if="isLoading" class="spinner" aria-hidden="true" />
        <span v-else>{{ t('login.solian') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  min-height: calc(100dvh - 12rem);
  align-items: center;
  justify-content: center;
  padding: 3rem 1.25rem;
}

.sheet {
  width: 100%;
  max-width: 26rem;
  padding: 2rem 1.75rem 1.75rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sheet);
  background: var(--color-base-200);
  text-align: center;
}

.mark {
  display: block;
  width: 1.75rem;
  height: 1.75rem;
  margin: 0 auto 1.25rem;
  color: var(--color-primary);
}

.page-title {
  margin: 0;
  font-size: 1.375rem;
}

.page-lede {
  margin: 0.4rem 0 1.5rem;
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.note {
  margin: 0 0 1rem;
  text-align: left;
}

.login-button {
  width: 100%;
}

.btn-mark {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 4px;
}

.spinner {
  width: 0.85rem;
  height: 0.85rem;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
