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
    class="fixed left-0 right-0 z-40 bg-base-100/95 shadow-sm backdrop-blur"
    :style="{ top: bannerHeight }"
  >
    <div class="container mx-auto w-full px-4">
      <!-- Mobile bar -->
      <div class="flex h-16 items-center justify-between md:hidden">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 shrink-0">
          <img src="/favicon.png" :alt="t('nav.brandName')" class="w-8 h-8">
          <span class="font-bold text-lg hidden sm:inline">{{ t('nav.brandName') }}</span>
        </NuxtLink>

        <div class="relative z-10 flex items-center gap-1 sm:gap-2 shrink-0">
          <div class="dropdown dropdown-end z-20">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1 px-2 max-md:w-9">
              <Languages class="w-5 h-5" />
              <span class="hidden sm:inline">{{ languageNames[lang] }}</span>
            </div>
            <ul tabindex="0" class="dropdown-content menu z-[60] w-40 rounded-box bg-base-100 p-2 shadow-lg">
              <li v-for="l in locales" :key="typeof l === 'string' ? l : l.code">
                <NuxtLink
                  :to="getLocalizedPath(typeof l === 'string' ? l : l.code)"
                  :class="{ active: (typeof l === 'string' ? l : l.code) === lang }"
                >
                  {{ typeof l === 'string' ? languageNames[l] || l : l.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <label class="swap swap-rotate btn btn-ghost btn-circle btn-sm px-2">
            <input type="checkbox" :checked="isDark" @change="toggleTheme">
            <Sun class="swap-on w-5 h-5" />
            <Moon class="swap-off w-5 h-5" />
          </label>

          <button
            class="btn btn-ghost btn-circle btn-sm relative px-2"
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

      <!-- Desktop bar -->
      <div class="hidden h-16 items-center justify-between md:flex">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 shrink-0">
          <img src="/favicon.png" :alt="t('nav.brandName')" class="w-8 h-8">
          <span class="font-bold text-lg">{{ t('nav.brandName') }}</span>
        </NuxtLink>

        <nav class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ul class="menu menu-horizontal px-1 gap-1">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink :to="item.to" class="btn btn-ghost btn-sm gap-1">
                <component :is="item.icon" class="w-4 h-4 me-2" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="relative z-10 flex items-center gap-1 sm:gap-2 shrink-0">
          <div class="dropdown dropdown-end z-20">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1 px-2">
              <Languages class="w-5 h-5" />
              <span class="hidden sm:inline">{{ languageNames[lang] }}</span>
            </div>
            <ul tabindex="0" class="dropdown-content menu z-[60] w-40 rounded-box bg-base-100 p-2 shadow-lg">
              <li v-for="l in locales" :key="typeof l === 'string' ? l : l.code">
                <NuxtLink
                  :to="getLocalizedPath(typeof l === 'string' ? l : l.code)"
                  :class="{ active: (typeof l === 'string' ? l : l.code) === lang }"
                >
                  {{ typeof l === 'string' ? languageNames[l] || l : l.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <label class="swap swap-rotate btn btn-ghost btn-circle btn-sm px-2">
            <input type="checkbox" :checked="isDark" @change="toggleTheme">
            <Sun class="swap-on w-5 h-5" />
            <Moon class="swap-off w-5 h-5" />
          </label>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Menu Panel -->
  <div id="mobile-menu" class="fixed inset-0 z-40 pointer-events-none md:hidden">
    <div
      class="absolute inset-0 bg-base-300/80 opacity-0 transition-opacity duration-300"
      :class="{ 'pointer-events-auto': isMobileMenuOpen }"
      :style="{ opacity: isMobileMenuOpen ? 1 : 0 }"
      @click="closeMobileMenu"
    />
    <div
      class="absolute left-0 right-0 bg-base-200 shadow-lg p-4 transition-all duration-300 pointer-events-auto"
      :style="{
        top: `calc(${bannerHeight} + 64px)`,
        opacity: isMobileMenuOpen ? 1 : 0,
        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-1rem)',
      }"
    >
      <nav>
        <ul class="menu menu-vertical gap-2">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="btn btn-ghost justify-start gap-2"
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
