<script setup lang="ts">
import {
  CircleUser,
  Mail,
  ShieldCheck,
  ExternalLink,
  Zap,
  GitBranch,
  RefreshCw,
  ArrowLeft,
} from '@lucide/vue'
import { useSolarProfile, useSolarFileUrl } from '~/composables/useSolarProfile'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

let session: any = null
if (import.meta.server) {
  session = ref(await useServerSession())
}
else {
  const { data } = await useAuth().useSession(useFetch)
  session = data
}

const { data: solarProfile, loading: solarLoading, fetch: fetchSolar } = useSolarProfile()

const refreshing = ref(false)
async function handleRefresh() {
  refreshing.value = true
  try {
    await $fetch('/api/sn/refresh-profile', { method: 'POST' })
    await fetchSolar()
  }
  catch {
    // refresh is best-effort
  }
  finally {
    refreshing.value = false
  }
}

const pictureUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.picture))
const backgroundUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.background))

const { status: claStatus, refresh: refreshCla } = useContribution()

const showEmail = ref(false)

const user = computed(() => {
  // session may be a Ref from useSession / useServerSession
  const s = session && typeof session === 'object' && 'value' in session
    ? session.value
    : session
  return s?.user ?? null
})

const displayName = computed(
  () => solarProfile.value?.nick || user.value?.name || '—',
)

onMounted(() => {
  void fetchSolar().catch(() => {})
  void refreshCla().catch(() => {})
})

useSeoMeta({
  title: () => t('nav.profile'),
  description: () => t('profile.subtitle'),
})
</script>

<template>
  <div>
    <section class="border-b border-base-200 px-4 py-12 md:py-16">
      <div class="container mx-auto max-w-lg">
        <NuxtLink
          :to="localePath('/')"
          class="btn btn-ghost btn-sm mb-8 -ml-2 gap-1.5 text-base-content/60"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('about.backToHome') }}
        </NuxtLink>

        <!-- Cover; avatar overlaps bottom only. Name stays fully below the banner. -->
        <div class="relative mb-12">
          <div class="h-28 overflow-hidden rounded-lg border border-base-200">
            <div
              v-if="backgroundUrl"
              class="h-full w-full bg-cover bg-center"
              :style="{ backgroundImage: `url(${backgroundUrl})` }"
            />
            <div
              v-else
              class="h-full w-full bg-base-200/60"
            />
          </div>

          <div class="absolute bottom-0 left-1 translate-y-1/2">
            <div class="relative">
              <img
                v-if="pictureUrl"
                :src="pictureUrl"
                :alt="displayName"
                class="h-20 w-20 rounded-full border-2 border-base-100 bg-base-200 object-cover"
              >
              <img
                v-else-if="user?.image"
                :src="user.image"
                :alt="displayName"
                class="h-20 w-20 rounded-full border-2 border-base-100 bg-base-200 object-cover"
              >
              <div
                v-else
                class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-base-100 bg-base-200"
              >
                <CircleUser class="h-10 w-10 text-base-content/30" />
              </div>
              <div
                v-if="user?.emailVerified"
                class="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-base-100 bg-success text-success-content"
                :title="t('profile.verified')"
              >
                <ShieldCheck class="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <div
            v-if="solarLoading"
            class="flex items-center gap-2 py-1"
          >
            <span class="loading loading-spinner loading-xs" />
          </div>
          <template v-else>
            <div class="flex items-center gap-2">
              <h1 class="truncate text-2xl font-extrabold tracking-tight">
                {{ displayName }}
              </h1>
              <button
                type="button"
                class="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/50"
                :disabled="refreshing"
                :title="t('profile.refresh')"
                @click="handleRefresh"
              >
                <span
                  v-if="refreshing"
                  class="loading loading-spinner loading-xs"
                />
                <RefreshCw
                  v-else
                  class="h-3.5 w-3.5"
                />
              </button>
            </div>
            <p
              v-if="solarProfile?.name"
              class="mt-0.5 text-sm text-base-content/50"
            >
              @{{ solarProfile.name }}
            </p>
          </template>
        </div>

        <div
          v-if="solarProfile?.perk_subscription?.is_active"
          class="mt-3"
        >
          <span class="badge badge-sm badge-outline gap-1 border-warning/40 text-warning">
            <Zap class="h-3 w-3" />
            {{ solarProfile.perk_subscription.display_name }}
            · Lv{{ solarProfile.perk_subscription.perk_level }}
          </span>
        </div>
      </div>
    </section>

    <section class="px-4 py-10">
      <div class="container mx-auto max-w-lg">
        <div class="divide-y divide-base-200 rounded-lg border border-base-200">
          <!-- Email -->
          <div class="flex items-center gap-3 px-4 py-4">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-200 bg-base-200/50">
              <Mail class="h-4 w-4 text-base-content/55" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-base-content/45">
                {{ t('profile.email') }}
              </p>
              <p
                class="cursor-pointer truncate text-sm transition-all"
                :class="showEmail ? '' : 'select-none blur-sm'"
                @click="showEmail = true"
              >
                {{ user?.email }}
              </p>
            </div>
            <span
              v-if="user?.emailVerified"
              class="badge badge-success badge-xs shrink-0"
            >
              {{ t('profile.verifiedShort') }}
            </span>
            <span
              v-else
              class="badge badge-warning badge-xs shrink-0"
            >
              {{ t('profile.unverified') }}
            </span>
          </div>

          <!-- Capital User ID -->
          <div class="flex items-center gap-3 px-4 py-4">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-200 bg-base-200/50">
              <ShieldCheck class="h-4 w-4 text-base-content/55" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-base-content/45">
                {{ t('profile.id') }}
              </p>
              <p class="truncate font-mono text-xs text-base-content/60">
                {{ user?.id }}
              </p>
            </div>
          </div>

          <!-- Solar Network -->
          <div
            v-if="solarProfile"
            class="flex items-center gap-3 px-4 py-4"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-200 bg-base-200/50">
              <ExternalLink class="h-4 w-4 text-base-content/55" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-base-content/45">
                {{ t('profile.solarNetwork') }}
              </p>
              <a
                :href="`https://id.solian.app/@${solarProfile.name}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-primary hover:underline"
              >
                @{{ solarProfile.name }}
              </a>
            </div>
          </div>

          <!-- GitHub -->
          <div
            v-if="claStatus?.githubConnected"
            class="flex items-center gap-3 px-4 py-4"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-200 bg-base-200/50">
              <GitBranch class="h-4 w-4 text-base-content/55" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-base-content/45">
                {{ t('profile.github') }}
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <a
                  :href="`https://github.com/${claStatus.githubUsername}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-primary hover:underline"
                >
                  @{{ claStatus.githubUsername }}
                </a>
                <NuxtLink
                  :to="localePath('/contributions/me')"
                  class="btn btn-ghost btn-xs border border-base-300"
                >
                  {{ t('profile.viewContribution') }}
                </NuxtLink>
              </div>
            </div>
            <span
              v-if="claStatus.signed"
              class="badge badge-success badge-xs shrink-0"
            >
              CLA
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
