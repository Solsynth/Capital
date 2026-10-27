<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

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

const year = new Date().getFullYear()

const productLinks = [
  { key: 'footer.icp', to: '/icp' },
  { key: 'footer.contributions', to: '/contributions' },
  { key: 'footer.catalog', to: '/products' },
] as const

function switchLocale(code: string) {
  const path = route.fullPath.replace(/^\/(en|zh)(?=\/|$)/, '')
  navigateTo(`/${code}${path || '/'}`)
}

// The footer is the only language switch on a phone, so it offers exactly the
// two locales as a capsule pair rather than a select.
const localeOptions = computed(() =>
  locales.value.map((l) => (typeof l === 'string' ? { code: l, name: l } : { code: l.code, name: l.name })),
)
</script>

<template>
  <footer class="site-footer">
    <div class="shell">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/favicon.png" alt="" class="brand-mark footer-glyph" width="24" height="24">
          <p class="footer-name">
            Solsynth
          </p>
          <p class="footer-tagline">
            {{ t('footer.tagline') }}
          </p>
          <!-- The filing number is a Chinese stamp, so it stays in the
               interface face: the mono face carries Latin glyphs only. -->
          <p class="footer-reg-line">
            <NuxtLink :to="localePath('/icp/202600000')" class="footer-reg">
              羝 ICP 备 202600000 号
            </NuxtLink>
          </p>
        </div>

        <nav class="footer-group" :aria-label="t('footer.products')">
          <h2 class="footer-heading">
            {{ t('footer.products') }}
          </h2>
          <NuxtLink v-for="link in productLinks" :key="link.key" :to="localePath(link.to)" class="footer-link">
            {{ t(link.key) }}
          </NuxtLink>
          <a href="https://solian.app" target="_blank" rel="noopener" class="footer-link">Solar Network</a>
        </nav>

        <nav class="footer-group" :aria-label="t('footer.community')">
          <h2 class="footer-heading">
            {{ t('footer.community') }}
          </h2>
          <NuxtLink :to="localePath('/about')" class="footer-link">
            {{ t('footer.aboutUs') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/updates')" class="footer-link">
            {{ t('nav.updates') }}
          </NuxtLink>
          <a href="https://github.com/Solsynth" target="_blank" rel="noopener" class="footer-link">
            {{ t('footer.github') }}
          </a>
        </nav>

        <nav class="footer-group" :aria-label="t('footer.legal')">
          <h2 class="footer-heading">
            {{ t('footer.legal') }}
          </h2>
          <NuxtLink :to="localePath('/legal/user-agreement')" class="footer-link">
            {{ t('footer.termsOfService') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal/privacy-policy')" class="footer-link">
            {{ t('footer.privacyPolicy') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal/refund-policy')" class="footer-link">
            {{ t('footer.refundPolicy') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal/solar-network-dev')" class="footer-link">
            {{ t('footer.developerAgreement') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/legal')" class="footer-link">
            {{ t('nav.legalAll') }}
          </NuxtLink>
        </nav>
      </div>

      <div class="footer-base">
        <p class="footer-copy">
          © {{ year }} Solsynth
          <NuxtLink v-if="isAdmin" :to="localePath('/admin')" class="footer-link footer-admin">
            {{ t('footer.adminPanel') }}
          </NuxtLink>
        </p>
        <div class="footer-locale" role="group" :aria-label="t('nav.language')">
          <button
            v-for="option in localeOptions"
            :key="option.code"
            type="button"
            class="footer-locale-btn"
            :class="{ 'is-current': option.code === locale }"
            :aria-pressed="option.code === locale"
            @click="switchLocale(option.code)"
          >
            {{ option.name }}
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 5rem;
  border-top: 1px solid var(--color-line-soft);
  padding-block: 2.75rem 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.footer-brand {
  max-width: 20rem;
}

.footer-glyph {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-faint);
}

.footer-name {
  margin: 0.75rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.footer-tagline {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.footer-reg-line {
  margin: 0.9rem 0 0;
  font-size: 0.75rem;
}

.footer-reg {
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.footer-reg:hover {
  color: var(--color-base-content);
}

.footer-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
}

.footer-heading {
  margin: 0 0 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-base-content);
}

.footer-link {
  font-size: 0.8125rem;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.footer-link:hover,
.footer-link:focus-visible {
  color: var(--color-base-content);
}

.footer-base {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-line-soft);
}

.footer-copy {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.footer-admin {
  font-size: 0.75rem;
}

.footer-locale {
  display: inline-flex;
  gap: 0.125rem;
  padding: 0.125rem;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
}

.footer-locale-btn {
  padding: 0.15rem 0.55rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.footer-locale-btn:hover {
  color: var(--color-base-content);
}

.footer-locale-btn.is-current {
  background: var(--color-base-300);
  color: var(--color-base-content);
}

.footer-locale-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

@media (min-width: 640px) {
  .footer-grid {
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
    gap: 2.5rem;
  }
}
</style>
