<script setup lang="ts">
import { FileCheck, ExternalLink, CheckCircle, AlertCircle, Loader2 } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

let session: any = null
if (import.meta.server) {
  session = ref(await useServerSession())
} else {
  const { data } = await useAuth().useSession(useFetch)
  session = data
}

const { status, loading, error, refresh, sign } = useContribution()

const { data: claContent } = await useAsyncData(`cla-content-${locale.value}`, () => {
  return queryCollection('legal')
    .where('path', '=', `/legal/${locale.value}/contributor-license`)
    .first()
})

await refresh()

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: t('seo.cla.title'),
  description: t('seo.cla.description'),
})
</script>

<template>
  <div class="container mx-auto px-8 py-16 max-w-3xl">
    <div class="flex items-center gap-3 mb-8">
      <FileCheck class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold">{{ t('cla.title') }}</h1>
    </div>

    <!-- Not signed in -->
    <div v-if="!session" class="card bg-base-200 p-8 text-center">
      <AlertCircle class="w-12 h-12 mx-auto mb-4 text-warning" />
      <p class="text-lg mb-4">{{ t('cla.signInRequired') }}</p>
      <NuxtLink :to="localePath('/auth/login')" class="btn btn-primary">
        {{ t('login.signIn') }}
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-else-if="loading && !status" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="status">
      <!-- Already signed -->
      <div v-if="status.signed" class="card bg-success/10 border border-success/30 p-8">
        <div class="flex items-center gap-3 mb-4">
          <CheckCircle class="w-8 h-8 text-success" />
          <h2 class="text-xl font-semibold">{{ t('cla.alreadySigned') }}</h2>
        </div>
        <div class="space-y-2 text-sm opacity-80">
          <p><span class="font-medium">{{ t('cla.githubUser') }}:</span> {{ status.githubUsername }}</p>
          <p><span class="font-medium">{{ t('cla.version') }}:</span> {{ status.signature?.claVersion }}</p>
          <p><span class="font-medium">{{ t('cla.signedAt') }}:</span> {{ new Date(status.signature!.signedAt).toLocaleString() }}</p>
        </div>
      </div>

      <!-- GitHub not connected -->
      <div v-else-if="!status.githubConnected" class="card bg-warning/10 border border-warning/30 p-8 text-center">
        <AlertCircle class="w-12 h-12 mx-auto mb-4 text-warning" />
        <h2 class="text-xl font-semibold mb-2">{{ t('cla.githubNotConnected') }}</h2>
        <p class="mb-4 opacity-80">{{ t('cla.connectGithubFirst') }}</p>
        <a
          href="https://solian.app/settings/connections"
          target="_blank"
          rel="noopener"
          class="btn btn-warning gap-2"
        >
          {{ t('cla.connectOnSolar') }}
          <ExternalLink class="w-4 h-4" />
        </a>
      </div>

      <!-- Ready to sign -->
      <div v-else>
        <div class="alert alert-info mb-6">
          <AlertCircle class="w-5 h-5" />
          <span>{{ t('cla.connectedAs') }} <strong>{{ status.githubUsername }}</strong></span>
        </div>

        <div v-if="claContent" class="prose prose-lg max-w-none bg-base-100 border border-base-300 rounded-lg p-6 mb-8 max-h-[60vh] overflow-y-auto">
          <ContentRenderer :value="claContent" />
        </div>

        <div v-if="error" class="alert alert-error mb-4">
          <span>{{ error }}</span>
        </div>

        <div class="flex justify-center">
          <button
            class="btn btn-primary btn-lg gap-2"
            :class="{ 'btn-disabled': loading }"
            :disabled="loading"
            @click="sign()"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <FileCheck v-else class="w-5 h-5" />
            {{ t('cla.agreeAndSign') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
