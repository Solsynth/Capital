<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// Use server-side session on server, client-side on client
let session: any = null
if (import.meta.server) {
  const serverSession = await useServerSession()
  session = ref(serverSession)
} else {
  const { data } = useAuth().useSession(useFetch) as any
  session = data
}

// Check if user is admin via API
const { data: adminCheck } = await useAsyncData(
  'admin-check',
  () => $fetch<{ isAdmin: boolean }>('/api/auth/role').catch(() => ({ isAdmin: false })),
  { watch: [session] }
)
const isAdmin = computed(() => adminCheck.value?.isAdmin ?? false)
</script>

<template>
  <footer class="footer bg-base-200 text-base-content p-8 md:p-10">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <aside class="col-span-1 sm:col-span-2 md:col-span-1">
          <img src="/favicon.png" alt="Solsynth" class="w-10 md:w-12">
          <div class="mt-2">
            <h3 class="font-bold text-lg">
              Solsynth
            </h3>
            <p class="text-sm opacity-70">
              {{ t('footer.tagline') }}
            </p>
            <NuxtLink v-if="isAdmin" :to="localePath('/admin')"
              class="link link-hover block text-xs opacity-65 hover:opacity-80 transition-opacity mt-4">
              {{ t('footer.adminPanel') || 'Admin Panel' }}
            </NuxtLink>
            <NuxtLink :to="localePath('/icp/202600000')"
              class="link link-hover block text-xs opacity-65 hover:opacity-80 transition-opacity"
              :class="isAdmin ? 'mt-1' : 'mt-4'">
              羝 ICP 备 202600000 号
            </NuxtLink>
          </div>
        </aside>
        <nav>
          <h6 class="footer-title">
            {{ t('footer.products') }}
          </h6>
          <NuxtLink :to="localePath('/icp')" class="link link-hover block text-sm">
            {{ t('seo.icp.title') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/contributions')" class="link link-hover block text-sm">
            {{ t('footer.contributions') }}
          </NuxtLink>
          <a href="https://solian.app" target="_blank" class="link link-hover block text-sm">Solar Network</a>
          <NuxtLink :to="localePath('/products')" class="link link-hover block text-sm">
            {{ t('footer.catalog') }}
          </NuxtLink>
        </nav>
        <nav>
          <h6 class="footer-title">
            {{ t('footer.community') }}
          </h6>
          <NuxtLink :to="localePath('/about')" class="link link-hover block text-sm">
            {{ t('footer.aboutUs') }}
          </NuxtLink>
          <a href="https://github.com/Solsynth" target="_blank" class="link link-hover block text-sm">
            {{ t('footer.github') }}
          </a>
        </nav>
        <nav>
          <h6 class="footer-title">
            {{ t('footer.legal') }}
          </h6>
          <NuxtLink :to="localePath('/legal/user-agreement')" class="link link-hover block text-sm">
            {{ t('footer.termsOfService') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal/privacy-policy')" class="link link-hover block text-sm">
            {{ t('footer.privacyPolicy') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal/refund-policy')" class="link link-hover block text-sm">
            {{ t('footer.refundPolicy') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal/solar-network-dev')" class="link link-hover block text-sm">
            {{ t('footer.developerAgreement') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal')" class="link link-hover block text-sm">
            {{ t('nav.legalAll') }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
