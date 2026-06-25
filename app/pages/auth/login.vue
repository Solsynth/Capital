<script setup lang="ts">
import { CircleUser, Mail, KeyRound, ArrowRight, ShieldCheck, UserPlus } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const auth = useAuth()

const email = ref('')
const password = ref('')
const name = ref('')
const isLoading = ref(false)
const error = ref('')

// --- setup flow ---
const setupSecret = computed(() => (route.query.setup as string) || '')
const needsSetup = ref(false)
const setupDone = ref(false)

onMounted(async () => {
  try {
    const res = await $fetch<{ needsSetup: boolean }>('/api/setup/status')
    needsSetup.value = res.needsSetup
  }
  catch { /* ignore */ }
})

const showSetupForm = computed(() => needsSetup.value && setupSecret.value && !setupDone.value)

async function handleSeedAdmin() {
  error.value = ''
  isLoading.value = true
  try {
    await $fetch('/api/setup/seed-admin', {
      method: 'POST',
      body: {
        secret: setupSecret.value,
        email: email.value,
        password: password.value,
        name: name.value,
      },
    })
    setupDone.value = true
    needsSetup.value = false
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Setup failed'
  }
  finally {
    isLoading.value = false
  }
}

// --- sign in flow ---
async function handleEmailSignIn() {
  error.value = ''
  isLoading.value = true
  console.log('[Login] Attempting email sign in for:', email.value)
  const { error: signInError } = await auth.signIn.email({
    email: email.value,
    password: password.value,
    callbackURL: localePath('/auth/profile'),
  })
  console.log('[Login] Sign in result:', signInError ? 'error' : 'success')
  if (signInError) {
    console.log('[Login] Sign in error:', signInError)
  }
  isLoading.value = false
  if (signInError) {
    error.value = signInError.message || 'Sign in failed'
  }
}

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

      <!-- Setup success -->
      <div v-if="setupDone" class="text-center">
        <ShieldCheck class="mx-auto mb-3 w-12 h-12 text-success" />
        <h1 class="text-2xl font-bold">Admin created</h1>
        <p class="mt-2 text-sm text-base-content/60">You can now sign in below.</p>
      </div>

      <!-- Setup form (only when ?setup=<secret> and no users exist) -->
      <form v-else-if="showSetupForm" class="flex flex-col gap-3" @submit.prevent="handleSeedAdmin">
        <div class="mb-4 text-center">
          <UserPlus class="mx-auto mb-3 w-12 h-12 text-primary" />
          <h1 class="text-2xl font-bold">Create admin account</h1>
          <p class="mt-1 text-sm text-base-content/60">First and only user — becomes superadmin.</p>
        </div>

        <label class="input input-bordered flex items-center gap-2 rounded-xl w-full">
          <CircleUser class="w-4 h-4 text-base-content/40" />
          <input v-model="name" type="text" placeholder="Name" class="grow" autocomplete="name" required>
        </label>

        <label class="input input-bordered flex items-center gap-2 rounded-xl w-full">
          <Mail class="w-4 h-4 text-base-content/40" />
          <input v-model="email" type="email" placeholder="Email" class="grow" autocomplete="email" required>
        </label>

        <label class="input input-bordered flex items-center gap-2 rounded-xl w-full">
          <KeyRound class="w-4 h-4 text-base-content/40" />
          <input v-model="password" type="password" placeholder="Password" class="grow" autocomplete="new-password" required minlength="8">
        </label>

        <p v-if="error" class="text-sm text-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary w-full gap-2 rounded-xl" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner loading-sm" />
          <template v-else>
            Create account
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>
      </form>

      <!-- Normal sign-in -->
      <template v-else>
        <div class="mb-8 text-center">
          <CircleUser class="mx-auto mb-3 w-12 h-12 text-base-content/30" />
          <h1 class="text-2xl font-bold">
            {{ t('login.title', 'Sign in') }}
          </h1>
          <p class="mt-1 text-sm text-base-content/60">
            {{ t('login.subtitle', 'Welcome back') }}
          </p>
        </div>

        <!-- Solian OIDC -->
        <button
          class="btn btn-outline w-full gap-2 rounded-xl"
          :disabled="isLoading"
          @click="handleSolianSignIn"
        >
          <img src="/favicon.png" alt="Solian" class="w-5 h-5 rounded-full">
          {{ t('login.solian', 'Continue with Solian') }}
        </button>

        <div class="divider text-xs text-base-content/40">
          {{ t('login.or', 'or') }}
        </div>

        <!-- Email / Password -->
        <form class="flex flex-col gap-3" @submit.prevent="handleEmailSignIn">
          <label class="input input-bordered flex items-center gap-2 rounded-xl w-full">
            <Mail class="w-4 h-4 text-base-content/40" />
            <input v-model="email" type="email" placeholder="Email" class="grow" autocomplete="email" required>
          </label>

          <label class="input input-bordered flex items-center gap-2 rounded-xl w-full">
            <KeyRound class="w-4 h-4 text-base-content/40" />
            <input v-model="password" type="password" placeholder="Password" class="grow" autocomplete="current-password" required>
          </label>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>

          <button type="submit" class="btn btn-primary w-full gap-2 rounded-xl" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-sm" />
            <template v-else>
              {{ t('login.signIn', 'Sign in') }}
              <ArrowRight class="w-4 h-4" />
            </template>
          </button>
        </form>

        <!-- Hint when no users exist but no secret provided -->
        <p v-if="needsSetup" class="mt-4 text-center text-xs text-base-content/40">
          No admin account exists yet.
        </p>
      </template>
    </div>
  </div>
</template>
