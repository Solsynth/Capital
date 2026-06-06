<script setup lang="ts">
import {
  Sun,
  Moon,
  Compass,
  Layers,
  Calendar,
  Newspaper,
  Menu,
  X,
  Languages,
  BadgeCheck,
} from 'lucide-vue-next'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

interface Props {
  bannerHeight?: string
}

const props = withDefaults(defineProps<Props>(), { bannerHeight: '20px' })

const lang = computed(() => locale.value)
const pathname = computed(() => route.fullPath)

const navItems = computed(() => [
  { to: localePath('/'), label: t('nav.explore'), icon: Compass },
  { to: localePath('/products'), label: t('nav.products'), icon: Layers },
  { to: localePath('/icp'), label: t('nav.icp'), icon: BadgeCheck },
  { to: localePath('/updates'), label: t('nav.updates'), icon: Newspaper },
])

const isMobileMenuOpen = ref(false)
const isDark = ref(false)

function syncTheme() {
  if (import.meta.server) return
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

function toggleTheme() {
  if (import.meta.server) return
  const theme = isDark.value ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  isDark.value = !isDark.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

function openMobileMenu() {
  isMobileMenuOpen.value = true
  document.body.style.overflow = 'hidden'
}

function toggleMobileMenu() {
  if (isMobileMenuOpen.value) {
    closeMobileMenu()
  }
  else {
    openMobileMenu()
  }
}

function getLocalizedPath(targetLang: string): string {
  const pathWithoutLang = pathname.value.replace(/^\/(en|zh)/, '')
  return `/${targetLang}${pathWithoutLang || '/'}`
}

const languageNames: Record<string, string> = {
  en: 'English',
  zh: '中文',
}

onMounted(() => {
  syncTheme()

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      isDark.value = e.matches
    }
  })

  document.querySelectorAll('#mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu()
    })
  })
})
</script>

<template>
  <header
    id="site-navbar"
    class="fixed left-5 right-5 z-40 overflow-visible md:left-1/2 md:-translate-x-1/2 md:w-[min(90rem,calc(100%-3rem))]"
    :style="{ top: `calc(${bannerHeight} + 20px)` }"
  >
    <div
      class="relative flex h-14 items-center justify-between rounded-full border border-base-content/10 bg-base-100/60 px-4 shadow-lg shadow-black/5 before:absolute before:inset-0 before:-z-10 before:rounded-full before:backdrop-blur-2xl before:content-[''] dark:border-base-content/5 dark:bg-base-100/40 dark:shadow-black/20 md:h-16 md:px-6"
    >
      <!-- Brand -->
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2 shrink-0">
        <img src="/favicon.png" :alt="t('nav.brandName')" class="w-8 h-8">
        <span class="font-bold text-lg hidden sm:inline">{{ t('nav.brandName') }}</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ul class="flex items-center gap-1">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
              active-class="!bg-base-content/10 !text-base-content"
            >
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Actions -->
      <div class="relative z-50 flex items-center gap-1 shrink-0">
        <div class="dropdown dropdown-end z-50">
          <div
            tabindex="0"
            role="button"
            class="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
          >
            <Languages class="w-5 h-5" />
            <span class="hidden sm:inline">{{ languageNames[lang] }}</span>
          </div>
          <ul tabindex="0" class="dropdown-content menu z-[100] w-40 rounded-2xl border border-base-content/10 bg-base-100/80 p-2 shadow-xl shadow-black/10 backdrop-blur-2xl dark:border-base-content/5 dark:bg-base-100/60">
            <li v-for="l in locales" :key="typeof l === 'string' ? l : l.code">
              <NuxtLink
                :to="getLocalizedPath(typeof l === 'string' ? l : l.code)"
                :class="{ active: (typeof l === 'string' ? l : l.code) === lang }"
                class="rounded-xl"
              >
                {{ typeof l === 'string' ? languageNames[l] || l : l.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <button
          class="flex items-center justify-center rounded-full w-9 h-9 text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <button
          class="relative flex items-center justify-center rounded-full w-9 h-9 text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content md:hidden"
          @click="toggleMobileMenu"
        >
          <Menu
            class="w-5 h-5 absolute transition-all duration-200"
            :class="isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'"
          />
          <X
            class="w-5 h-5 absolute transition-all duration-200"
            :class="isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'"
          />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Menu Panel -->
  <div id="mobile-menu" class="fixed inset-0 z-40 pointer-events-none md:hidden">
    <div
      class="absolute inset-0 bg-base-300/60 backdrop-blur-sm opacity-0 transition-opacity duration-300"
      :class="{ 'pointer-events-auto': isMobileMenuOpen }"
      :style="{ opacity: isMobileMenuOpen ? 1 : 0 }"
      @click="closeMobileMenu"
    />
    <div
      class="absolute left-5 right-5 rounded-2xl border border-base-content/10 bg-base-100/70 p-3 shadow-xl shadow-black/10 backdrop-blur-2xl transition-all duration-300 pointer-events-auto dark:border-base-content/5 dark:bg-base-100/50"
      :style="{
        top: `calc(${bannerHeight} + 96px)`,
        opacity: isMobileMenuOpen ? 1 : 0,
        transform: isMobileMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-0.5rem) scale(0.98)',
      }"
    >
      <nav>
        <ul class="flex flex-col gap-1">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
              active-class="!bg-base-content/10 !text-base-content"
              @click="closeMobileMenu"
            >
              <component :is="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
