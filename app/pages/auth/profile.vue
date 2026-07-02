<script setup lang="ts">
import { CircleUser, Mail, ShieldCheck, ExternalLink, Zap, GitBranch } from '@lucide/vue'
import { useSolarProfile, useSolarFileUrl } from '~/composables/useSolarProfile'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

let session: any = null
if (import.meta.server) {
  session = ref(await useServerSession())
} else {
  const { data } = await useAuth().useSession(useFetch)
  session = data
}

const { data: solarProfile, loading: solarLoading, fetch: fetchSolar } = useSolarProfile()
onMounted(() => fetchSolar())

const refreshing = ref(false)
async function handleRefresh() {
  refreshing.value = true
  try {
    await $fetch('/api/sn/refresh-profile', { method: 'POST' })
    await fetchSolar()
  } catch { /* ignore */ } finally {
    refreshing.value = false
  }
}
const pictureUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.picture))
const backgroundUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.background))

const { status: claStatus, refresh: refreshCla } = useContribution()
onMounted(() => refreshCla())

const showEmail = ref(false)
</script>

<template>
  <div class="flex min-h-[calc(100dvh-200px)] items-start justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="relative">
          <div
            v-if="backgroundUrl"
            class="h-24 rounded-2xl bg-cover bg-center"
            :style="{ backgroundImage: `url(${backgroundUrl})` }"
          />
          <div v-else class="h-24 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20" />
          <div class="relative mx-auto -mt-10 mb-4 w-20 h-20">
            <img
              v-if="pictureUrl"
              :src="pictureUrl"
              :alt="solarProfile?.nick || session?.user.name"
              class="w-20 h-20 rounded-full object-cover ring-2 ring-base-content/10"
            >
            <img
              v-else-if="session?.user.image"
              :src="session.user.image"
              :alt="session.user.name"
              class="w-20 h-20 rounded-full object-cover ring-2 ring-base-content/10"
            >
            <div v-else class="w-20 h-20 rounded-full bg-base-content/5 flex items-center justify-center ring-2 ring-base-content/10">
              <CircleUser class="w-10 h-10 text-base-content/30" />
            </div>
            <div
              v-if="session?.user.emailVerified"
              class="absolute -bottom-1 -right-1 badge badge-sm badge-success gap-1 px-1.5"
              :title="t('profile.verified', 'Email verified')"
            >
              <ShieldCheck class="w-3 h-3" />
            </div>
          </div>
        </div>

         <div v-if="solarLoading" class="flex justify-center">
           <span class="loading loading-spinner loading-xs" />
         </div>
         <div v-else>
           <div class="flex items-center justify-center gap-2">
             <h1 class="text-2xl font-bold">
               {{ solarProfile?.nick || session?.user.name }}
             </h1>
             <button
               class="btn btn-ghost btn-xs"
               :disabled="refreshing"
               title="Refresh profile from Solarpass"
               @click="handleRefresh"
             >
               <span v-if="refreshing" class="loading loading-spinner loading-xs" />
               <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
             </button>
           </div>
           <div
             v-if="solarProfile?.perk_subscription?.is_active"
             class="badge badge-warning badge-outline badge-sm gap-1 mt-2"
           >
             <Zap class="w-3 h-3" />
             {{ solarProfile.perk_subscription.display_name }} · Lv{{ solarProfile.perk_subscription.perk_level }}
           </div>
         </div>
      </div>

      <!-- Info cards -->
      <div class="flex flex-col gap-3">
        <!-- Email -->
        <div class="card bg-base-100/50 border border-base-content/5">
          <div class="card-body p-4 gap-3">
            <div class="flex items-center gap-3">
              <Mail class="w-4 h-4 text-base-content/40 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-base-content/40">
                  {{ t('profile.email', 'Email') }}
                </p>
                <p
                  class="text-sm truncate cursor-pointer transition-all duration-200"
                  :class="showEmail ? '' : 'blur-sm select-none'"
                  @click="showEmail = true"
                >
                  {{ session?.user.email }}
                </p>
              </div>
              <div v-if="session?.user.emailVerified" class="badge badge-success badge-xs ml-auto shrink-0">
                {{ t('profile.verified', 'Verified') }}
              </div>
              <div v-else class="badge badge-warning badge-xs ml-auto shrink-0">
                {{ t('profile.unverified', 'Unverified') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Capital User ID -->
        <div class="card bg-base-100/50 border border-base-content/5">
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <ShieldCheck class="w-4 h-4 text-base-content/40 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-base-content/40">
                  {{ t('profile.id', 'Capital User ID') }}
                </p>
                <p class="text-xs font-mono text-base-content/60 truncate">
                  {{ session?.user.id }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Solar Network -->
        <div v-if="solarProfile" class="card bg-base-100/50 border border-base-content/5">
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <ExternalLink class="w-4 h-4 text-base-content/40 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-base-content/40">
                  Solar Network
                </p>
                <a
                  :href="`https://id.solian.app/@${solarProfile.name}`"
                  target="_blank"
                  class="text-sm text-primary/70 hover:text-primary transition-colors"
                >
                  @{{ solarProfile.name }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- GitHub Connection -->
        <div v-if="claStatus?.githubConnected" class="card bg-base-100/50 border border-base-content/5">
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <GitBranch class="w-4 h-4 text-base-content/40 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-base-content/40">
                  GitHub
                </p>
                <div class="flex gap-2 items-center">
                  <a
                    :href="`https://github.com/${claStatus.githubUsername}`"
                    target="_blank"
                    class="text-sm text-primary/70 hover:text-primary transition-colors"
                  >
                    @{{ claStatus.githubUsername }}
                  </a>
                  <NuxtLink
                    :to="localePath('/contributions/me')"
                    class="btn btn-ghost btn-xs"
                  >
                    {{ t('profile.viewContribution') }}
                  </NuxtLink>
                </div>
              </div>
              <div v-if="claStatus.signed" class="badge badge-success badge-xs ml-auto shrink-0">
                CLA
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
