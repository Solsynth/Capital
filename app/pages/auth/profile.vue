<script setup lang="ts">
import { CircleUser, Mail, ShieldCheck, Edit3, Check, X, ExternalLink, Zap } from '@lucide/vue'
import { useSolarProfile, useSolarFileUrl } from '~/composables/useSolarProfile'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

// Use server-side session on server, client-side on client
let session: any = null
let refresh: any = null
if (import.meta.server) {
  const serverSession = await useServerSession()
  session = ref(serverSession)
  refresh = () => {} // No-op on server
} else {
  const { data, refresh: clientRefresh } = await useAuth().useSession(useFetch)
  session = data
  refresh = clientRefresh
}

// Solar Network profile
const { data: solarProfile, loading: solarLoading, fetch: fetchSolar } = useSolarProfile()
onMounted(() => fetchSolar())
const pictureUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.picture))
const backgroundUrl = computed(() => useSolarFileUrl(solarProfile.value?.profile?.background))

const isEditing = ref(false)
const showEmail = ref(false)
const editName = ref('')
const editError = ref('')
const isSaving = ref(false)

function startEdit() {
  editName.value = session.value?.user.name || ''
  editError.value = ''
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveName() {
  if (!editName.value.trim()) {
    editError.value = 'Name cannot be empty'
    return
  }
  isSaving.value = true
  editError.value = ''
  try {
    await $fetch('/api/auth/update-user', {
      method: 'POST',
      body: { name: editName.value.trim() },
    })
    await refresh()
    isEditing.value = false
  }
  catch (e: any) {
    editError.value = e?.data?.statusMessage || e?.message || 'Failed to update'
  }
  finally {
    isSaving.value = false
  }
}

function formatDate(ts: string | Date) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-200px)] items-start justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="mb-8 text-center">
        <!-- Background + Avatar -->
        <div class="relative">
          <div
            v-if="backgroundUrl"
            class="h-24 rounded-2xl bg-cover bg-center"
            :style="{ backgroundImage: `url(${backgroundUrl})` }"
          />
          <div v-else class="h-24 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20" />
          <!-- Avatar -->
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

        <!-- Name -->
        <div v-if="solarLoading" class="flex justify-center">
          <span class="loading loading-spinner loading-xs" />
        </div>
        <div v-else-if="!isEditing">
          <h1 class="text-2xl font-bold">
            {{ solarProfile?.nick || session?.user.name }}
          </h1>
          <!-- Perk -->
          <div
            v-if="solarProfile?.perk_subscription?.is_active"
            class="badge badge-warning badge-outline badge-sm gap-1 mt-2"
          >
            <Zap class="w-3 h-3" />
            {{ solarProfile.perk_subscription.display_name }} · Lv{{ solarProfile.perk_subscription.perk_level }}
          </div>
          <button
            class="btn btn-ghost btn-xs gap-1 mt-2 text-base-content/50"
            @click="startEdit"
          >
            <Edit3 class="w-3 h-3" />
            {{ t('profile.editName', 'Edit name') }}
          </button>
        </div>

        <!-- Edit name -->
        <form v-else class="mt-2 flex flex-col items-center gap-2" @submit.prevent="saveName">
          <div class="join">
            <input
              v-model="editName"
              type="text"
              class="input input-bordered input-sm join-item w-48"
              :placeholder="t('profile.namePlaceholder', 'Your name')"
              autofocus
            >
            <button
              type="submit"
              class="btn btn-sm btn-primary join-item"
              :disabled="isSaving"
            >
              <Check v-if="!isSaving" class="w-4 h-4" />
              <span v-else class="loading loading-spinner loading-xs" />
            </button>
            <button
              type="button"
              class="btn btn-sm join-item"
              @click="cancelEdit"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <p v-if="editError" class="text-xs text-error">
            {{ editError }}
          </p>
        </form>
      </div>

      <!-- Info cards -->
      <div class="flex flex-col gap-3">
        <!-- Email (blurred by default) -->
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
      </div>
    </div>
  </div>
</template>
