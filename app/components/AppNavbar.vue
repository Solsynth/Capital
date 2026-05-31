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

const isNavbarExpanded = ref(true)
const isMobileMenuOpen = ref(false)
const isDark = ref(false)

let lastScrollY = 0
let scrollDirection: 'up' | 'down' | null = null
let directionalScrollDistance = 0

const NAVBAR_MIN_SCROLL_DELTA = 2
const NAVBAR_COLLAPSE_DISTANCE = 120

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

function setNavbarExpanded(shouldExpand: boolean) {
  if (isNavbarExpanded.value === shouldExpand) return
  isNavbarExpanded.value = shouldExpand
}

function handleScroll() {
  const scrollY = window.scrollY

  if (scrollY <= 0) {
    lastScrollY = 0
    scrollDirection = null
    directionalScrollDistance = 0
    setNavbarExpanded(true)
    return
  }

  const delta = scrollY - lastScrollY

  if (Math.abs(delta) < NAVBAR_MIN_SCROLL_DELTA) {
    lastScrollY = scrollY
    return
  }

  const nextDirection = delta > 0 ? 'down' : 'up'

  if (scrollDirection !== nextDirection) {
    scrollDirection = nextDirection
    directionalScrollDistance = 0
  }

  directionalScrollDistance += Math.abs(delta)

  if (nextDirection === 'down' && directionalScrollDistance >= NAVBAR_COLLAPSE_DISTANCE) {
    setNavbarExpanded(false)
    directionalScrollDistance = 0
  }

  lastScrollY = scrollY
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

function renderLanguageSwitcher() {
  return null
}

onMounted(() => {
  syncTheme()
  window.addEventListener('scroll', handleScroll, { passive: true })

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

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <header
    id="site-navbar"
    class="fixed left-0 right-0 z-40 bg-base-100/95 shadow-sm backdrop-blur transition-[top,box-shadow,background-color] duration-200 ease-out"
    :style="{ top: bannerHeight }"
    :data-expanded="isNavbarExpanded"
  >
    <!-- Expanded shell (brand + nav bar) — visible when expanded on desktop -->
    <div
      data-navbar-expanded-shell
      class="overflow-visible transition-[max-height,opacity,transform] duration-300 ease-out will-change-[max-height,opacity,transform] md:block"
    >
      <div class="container mx-auto w-full px-4">
        <div data-navbar-expanded class="py-5">
          <div class="flex items-center justify-between gap-6">
            <NuxtLink :to="localePath('/')" class="flex min-w-0 items-center gap-4 shrink-0">
              <img src="/favicon.png" :alt="t('nav.brandName')" class="h-16 w-16 shrink-0">
              <div class="pl-2">
                <p class="text-2xl font-extrabold leading-none">
                  {{ t('nav.brandName') }}
                </p>
                <p class="mt-1 text-sm text-base-content/70">
                  {{ t('nav.brandOrgName') }}
                </p>
              </div>
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
            </div>
          </div>
        </div>
      </div>

      <nav
        data-navbar-expanded-nav
        class="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-primary text-primary-content shadow-sm"
      >
        <div class="container mx-auto w-full px-4">
          <ul class="grid grid-cols-4">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex h-16 items-center justify-center gap-2 px-4 text-lg font-bold tracking-wide transition-colors hover:bg-base-content/10"
              >
                <component :is="item.icon" class="w-5 h-5" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- Compact navbar container (always in DOM) -->
    <div class="container mx-auto w-full px-4">
      <!-- Mobile compact bar -->
      <div data-navbar-compact class="flex h-16 items-center justify-between">
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
            id="mobile-menu-btn"
            class="btn btn-ghost btn-circle btn-sm relative px-2"
            @click="toggleMobileMenu"
          >
            <Menu
              id="menu-icon"
              class="w-5 h-5 absolute transition-all duration-200"
              :class="isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'"
            />
            <X
              id="close-icon"
              class="w-5 h-5 absolute transition-all duration-200"
              :class="isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'"
            />
          </button>
        </div>
      </div>

      <!-- Desktop compact bar (with centered nav) -->
      <div data-navbar-compact-desktop class="hidden h-16 items-center justify-between md:flex">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 shrink-0">
          <img src="/favicon.png" :alt="t('nav.brandName')" class="w-8 h-8">
          <span class="font-bold text-lg hidden sm:inline">{{ t('nav.brandName') }}</span>
        </NuxtLink>

        <nav class="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
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

<style scoped>
/* Expanded state: show expanded shell, hide compact desktop */
#site-navbar[data-expanded="true"] [data-navbar-expanded-shell] {
  opacity: 1;
  max-height: 42rem;
  pointer-events: auto;
  overflow: visible;
}

#site-navbar[data-expanded="true"] [data-navbar-expanded-nav] {
  opacity: 1;
  transform: translateY(0);
  max-height: 5rem;
  pointer-events: auto;
}

#site-navbar[data-expanded="true"] [data-navbar-compact-desktop] {
  display: none;
}

/* Collapsed state: hide expanded shell, show compact desktop */
#site-navbar[data-expanded="false"] [data-navbar-expanded-shell] {
  opacity: 0;
  transform: translateY(-0.5rem);
  max-height: 0;
  overflow: hidden;
  pointer-events: none;
}

#site-navbar[data-expanded="false"] [data-navbar-expanded-nav] {
  opacity: 0;
  transform: translateY(-0.5rem);
  max-height: 0;
  pointer-events: none;
}

#site-navbar[data-expanded="false"] [data-navbar-compact-desktop] {
  display: flex;
}

/* Mobile: always hide expanded shell and compact-desktop, show compact bar */
@media (max-width: 767px) {
  #site-navbar [data-navbar-expanded-shell],
  #site-navbar [data-navbar-compact-desktop] {
    display: none !important;
  }

  #site-navbar [data-navbar-compact] {
    display: flex;
  }
}

/* Desktop: hide compact bar, show expanded or compact-desktop based on state */
@media (min-width: 768px) {
  #site-navbar [data-navbar-compact] {
    display: none !important;
  }
}
</style>
