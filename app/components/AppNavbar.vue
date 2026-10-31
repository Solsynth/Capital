<script setup lang="ts">
import {
  Sun,
  Moon,
  Monitor,
  Compass,
  Layers,
  Newspaper,
  Menu,
  X,
  Languages,
  CircleUser,
  LogOut,
  UserRound,
} from "@lucide/vue";

const { t, locale, locales } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

// Use server-side session on server, client-side on client
let session: any = null;
if (import.meta.server) {
  session = ref(await useServerSession());
} else {
  const { data } = await useAuth().useSession(useFetch);
  session = data;
}

const { data: solarProfile, fetch: fetchSolar } = useSolarProfile();
onMounted(() => {
  if (session?.value?.user) fetchSolar();
});
const solarAvatar = computed(() =>
  useSolarFileUrl(solarProfile.value?.profile?.picture),
);

interface Props {
  bannerHeight?: string;
}

const props = withDefaults(defineProps<Props>(), { bannerHeight: "0px" });

const lang = computed(() => locale.value);
const pathname = computed(() => route.fullPath);

const navItems = computed(() => [
  { to: localePath("/"), label: t("nav.explore"), icon: Compass, exact: true },
  {
    to: localePath("/products"),
    label: t("nav.products"),
    icon: Layers,
    exact: false,
  },
  {
    to: localePath("/updates"),
    label: t("nav.updates"),
    icon: Newspaper,
    exact: false,
  },
]);

const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);
const themeMode = ref<"auto" | "light" | "dark">("auto");

const displayName = computed(
  () =>
    solarProfile.value?.nick ||
    solarProfile.value?.name ||
    session.value?.user?.name,
);

const languageNames: Record<string, string> = {
  en: "English",
  zh: "中文",
};

const localeCodes: Record<string, string> = {
  en: "EN",
  zh: "中",
};

const themeLabel = computed(() =>
  themeMode.value === "auto"
    ? "Auto (system)"
    : themeMode.value === "dark"
      ? "Dark"
      : "Light",
);

function onScroll() {
  if (typeof window !== "undefined") {
    isScrolled.value = window.scrollY > 15;
  }
}

// The theme preference is stored as a mode; the document attribute is the
// theme name the stylesheet declares.
function themeName(mode: "auto" | "light" | "dark"): string {
  const resolved =
    mode === "auto"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : mode;
  return resolved === "light" ? "stargate-light" : "stargate";
}

function applyTheme(mode: "auto" | "light" | "dark") {
  if (import.meta.server) return;
  document.documentElement.setAttribute("data-theme", themeName(mode));
}

function syncTheme() {
  if (import.meta.server) return;
  const stored = localStorage.getItem("theme") as
    | "auto"
    | "light"
    | "dark"
    | null;
  themeMode.value = stored || "auto";
  applyTheme(themeMode.value);
}

function cycleTheme() {
  if (import.meta.server) return;
  const next =
    themeMode.value === "auto"
      ? "light"
      : themeMode.value === "light"
        ? "dark"
        : "auto";
  themeMode.value = next;
  localStorage.setItem("theme", next);
  applyTheme(next);
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
  if (import.meta.client) document.body.style.overflow = "";
}

function openMobileMenu() {
  isMobileMenuOpen.value = true;
  document.body.style.overflow = "hidden";
}

function toggleMobileMenu() {
  if (isMobileMenuOpen.value) closeMobileMenu();
  else openMobileMenu();
}

function getLocalizedPath(targetLang: string): string {
  const pathWithoutLang = pathname.value.replace(/^\/(en|zh)/, "");
  return `/${targetLang}${pathWithoutLang || "/"}`;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isMobileMenuOpen.value) closeMobileMenu();
}

let mediaQuery: MediaQueryList | null = null;
function onSystemThemeChange() {
  if (themeMode.value === "auto") applyTheme("auto");
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu();
    if (import.meta.client) {
      nextTick(() => onScroll());
    }
  },
);

onMounted(() => {
  syncTheme();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onSystemThemeChange);
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  mediaQuery?.removeEventListener("change", onSystemThemeChange);
  window.removeEventListener("keydown", onKeydown);
  closeMobileMenu();
});
</script>

<template>
  <header
    id="site-navbar"
    class="site-navbar"
    :class="{
      'is-open': isMobileMenuOpen,
      'is-scrolled': isScrolled,
    }"
    :style="{ top: props.bannerHeight ? `calc(${props.bannerHeight})` : '0px' }"
  >
    <div class="shell nav-shell">
      <div
        class="nav-pill"
        :class="{
          'is-scrolled': isScrolled || isMobileMenuOpen,
        }"
      >
        <NuxtLink
          :to="localePath('/')"
          class="brand"
          :aria-label="t('nav.brandName')"
        >
          <img
            src="/favicon.png"
            alt=""
            class="brand-mark brand-glyph"
            width="24"
            height="24"
          >
          <span class="brand-name">{{ t("nav.brandName") }}</span>
        </NuxtLink>

        <nav class="desktop-nav" :aria-label="t('nav.brandName')">
          <ul class="desktop-nav-list">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="nav-link"
                :active-class="item.exact ? undefined : 'is-active'"
                exact-active-class="is-active"
              >
                <component :is="item.icon" class="nav-link-icon" aria-hidden="true" />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="nav-actions">
          <div class="dropdown dropdown-end">
            <button
              tabindex="0"
              type="button"
              class="nav-btn locale-btn"
              :aria-label="languageNames[lang] || lang"
              :title="languageNames[lang] || lang"
            >
              <Languages class="icon" />
              <span class="locale-code">{{ localeCodes[lang] || String(lang).toUpperCase() }}</span>
            </button>
            <ul
              tabindex="0"
              class="dropdown-content nav-popover menu"
            >
              <li v-for="l in locales" :key="typeof l === 'string' ? l : l.code">
                <NuxtLink
                  :to="getLocalizedPath(typeof l === 'string' ? l : l.code)"
                  :class="{
                    'is-current': (typeof l === 'string' ? l : l.code) === lang,
                  }"
                >
                  {{ typeof l === "string" ? languageNames[l] || l : l.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div v-if="session?.user" class="dropdown dropdown-end">
            <button
              tabindex="0"
              type="button"
              class="nav-btn avatar-btn"
              :aria-label="t('nav.profile')"
            >
              <img
                v-if="solarAvatar"
                :src="solarAvatar"
                :alt="displayName"
                class="avatar-img"
              >
              <img
                v-else-if="session.user.image"
                :src="session.user.image"
                :alt="session.user.name"
                class="avatar-img"
              >
              <CircleUser v-else class="icon" />
            </button>
            <div tabindex="0" class="dropdown-content nav-popover account-popover">
              <div class="account-identity">
                <img
                  v-if="solarAvatar"
                  :src="solarAvatar"
                  alt=""
                  class="avatar-img lg"
                >
                <img
                  v-else-if="session.user.image"
                  :src="session.user.image"
                  alt=""
                  class="avatar-img lg"
                >
                <div v-else class="avatar-fallback">
                  <CircleUser class="icon muted" />
                </div>
                <div class="account-copy">
                  <p class="account-name">
                    {{ displayName }}
                  </p>
                  <p
                    v-if="solarProfile?.name"
                    class="account-meta"
                  >
                    @{{ solarProfile.name }}
                  </p>
                  <p
                    v-else-if="session?.user?.email"
                    class="account-meta"
                  >
                    {{ session.user.email }}
                  </p>
                </div>
              </div>
              <ul class="menu">
                <li>
                  <NuxtLink :to="localePath('/auth/profile')" @click.stop>
                    <UserRound class="icon" />
                    {{ t("nav.profile") }}
                  </NuxtLink>
                </li>
                <li>
                  <button
                    type="button"
                    class="sign-out"
                    @click.stop="useAuth().signOut()"
                  >
                    <LogOut class="icon" />
                    {{ t("nav.signOut") }}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <NuxtLink
            v-else
            :to="localePath('/auth/login')"
            class="sign-in"
            :aria-label="t('login.title')"
          >
            <span class="sign-in-label">{{ t("login.title") }}</span>
          </NuxtLink>

          <button
            type="button"
            class="nav-btn theme-btn"
            :title="themeLabel"
            :aria-label="themeLabel"
            @click="cycleTheme"
          >
            <Monitor v-if="themeMode === 'auto'" class="icon" />
            <Sun v-else-if="themeMode === 'dark'" class="icon" />
            <Moon v-else class="icon" />
          </button>

          <button
            type="button"
            class="nav-btn menu-toggle"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-menu"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
            @click="toggleMobileMenu"
          >
            <Menu
              class="icon menu-glyph"
              :class="isMobileMenuOpen ? 'is-hidden' : 'is-shown'"
            />
            <X
              class="icon menu-glyph"
              :class="isMobileMenuOpen ? 'is-shown' : 'is-hidden'"
            />
          </button>
        </div>
      </div>
    </div>
  </header>

  <div
    id="mobile-menu"
    class="mobile-layer"
    :class="{ 'is-open': isMobileMenuOpen }"
    :inert="!isMobileMenuOpen"
  >
    <div class="mobile-scrim" @click="closeMobileMenu" />
    <nav
      class="mobile-sheet"
      :style="{ top: `calc(${props.bannerHeight || '0px'} + 4.375rem)` }"
      :aria-hidden="!isMobileMenuOpen"
    >
      <ul class="mobile-sheet-nav">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="sheet-link"
            :active-class="item.exact ? undefined : 'is-active'"
            exact-active-class="is-active"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" class="sheet-ico" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
      <div class="sheet-foot">
        <NuxtLink
          v-if="session?.user"
          :to="localePath('/auth/profile')"
          class="sheet-link"
          @click="closeMobileMenu"
        >
          <UserRound class="sheet-ico" />
          <span>{{ t("nav.profile") }}</span>
        </NuxtLink>
        <NuxtLink
          v-else
          :to="localePath('/auth/login')"
          class="sheet-link"
          @click="closeMobileMenu"
        >
          <CircleUser class="sheet-ico" />
          <span>{{ t("login.title") }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.site-navbar {
  --nav-h: 3.25rem;
  --nav-ink: var(--color-base-content);
  --nav-quiet: var(--color-faint);
  --nav-line: var(--color-line-soft);
  --nav-hover: color-mix(in oklab, var(--color-base-300) 65%, transparent);

  position: fixed;
  inset-inline: 0;
  z-index: 50;
  padding-top: 0.625rem;
  pointer-events: none;
  transition: padding-top 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 640px) {
  .site-navbar {
    padding-top: 0.875rem;
  }
}

.nav-shell {
  display: flex;
  justify-content: center;
}

.nav-pill {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--nav-h);
  padding: 0 0.5rem 0 0.875rem;
  border-radius: 9999px;
  background: transparent;
  border: 1px solid transparent;
  box-shadow: 0 0 0 0 transparent;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  transition:
    background-color 280ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 280ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1),
    backdrop-filter 280ms cubic-bezier(0.16, 1, 0.3, 1),
    -webkit-backdrop-filter 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 640px) {
  .nav-pill {
    padding: 0 0.625rem 0 1.125rem;
  }
}

/* Scrolled state: frosted glass effect */
.nav-pill.is-scrolled {
  background: color-mix(in oklab, var(--color-base-100) 72%, transparent);
  border-color: color-mix(in oklab, var(--color-line-soft) 50%, transparent);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 10px 30px -10px rgb(0 0 0 / 0.3),
    0 1px 2px 0 rgb(0 0 0 / 0.08);
}

:global([data-theme="stargate-light"]) .nav-pill.is-scrolled {
  background: color-mix(in oklab, var(--color-base-100) 78%, transparent);
  border-color: color-mix(in oklab, var(--color-line-soft) 60%, transparent);
  box-shadow:
    0 10px 25px -8px rgb(0 0 0 / 0.05),
    0 1px 2px 0 rgb(0 0 0 / 0.03);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
  color: var(--nav-ink);
  text-decoration: none;
  border-radius: 9999px;
  padding: 0.25rem 0.375rem 0.25rem 0.25rem;
  transition: opacity 140ms ease;
}

.brand:hover {
  opacity: 0.9;
}

.brand:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.brand-glyph {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 6px;
}

.brand-name {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1;
}

.desktop-nav {
  display: none;
  margin-left: 1rem;
}

.desktop-nav-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.125rem;
  padding-inline: 0.85rem;
  border-radius: 9999px;
  color: var(--nav-quiet);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.nav-link-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  opacity: 0.75;
  transition: opacity 140ms ease;
}

.nav-link:hover {
  color: var(--nav-ink);
  background: var(--nav-hover);
}

.nav-link:hover .nav-link-icon {
  opacity: 1;
}

.nav-link.is-active {
  color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
}

.nav-link.is-active .nav-link-icon {
  opacity: 1;
  color: var(--color-primary);
}

.nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
  margin-left: auto;
}

.nav-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--nav-quiet);
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.nav-btn:hover,
.nav-btn:focus-visible {
  color: var(--nav-ink);
  background: var(--nav-hover);
}

.nav-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* On a phone the header keeps only the essentials: brand, sign-in, theme, menu. */
.locale-btn {
  display: none;
  width: auto;
  min-width: 2.125rem;
  gap: 0.35rem;
  padding-inline: 0.6rem;
}

.locale-code {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.icon {
  width: 1.0625rem;
  height: 1.0625rem;
}

.icon.muted {
  color: var(--nav-quiet);
}

.sign-in {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.125rem;
  padding-inline: 0.95rem;
  border: 1px solid var(--nav-line);
  border-radius: 9999px;
  color: var(--nav-ink);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  background: color-mix(in oklab, var(--color-base-200) 40%, transparent);
  transition:
    color 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease;
}

.sign-in:hover,
.sign-in:focus-visible {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 10%, transparent);
}

.sign-in:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.menu-toggle {
  display: inline-flex;
  overflow: hidden;
}

.menu-toggle .menu-glyph {
  position: absolute;
  inset: 0;
  margin: auto;
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.menu-toggle .menu-glyph.is-shown {
  opacity: 1;
  transform: rotate(0deg);
}

.menu-toggle .menu-glyph.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: rotate(90deg);
}

.avatar-img {
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 9999px;
  object-fit: cover;
}

.avatar-img.lg {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
}

.avatar-btn {
  overflow: hidden;
  border: 1px solid var(--nav-line);
  transition: border-color 140ms ease;
}

.avatar-btn:hover {
  border-color: var(--color-primary);
}

.nav-popover {
  z-index: 100;
  margin-top: 0.5rem;
  padding: 0.375rem;
  min-width: 11rem;
  border: 1px solid color-mix(in oklab, var(--color-line-soft) 60%, transparent);
  border-radius: 1rem;
  background: color-mix(in oklab, var(--color-base-200) 86%, transparent);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.4);
  color: var(--nav-ink);
}

:global([data-theme="stargate-light"]) .nav-popover {
  background: color-mix(in oklab, var(--color-base-200) 90%, transparent);
  box-shadow: 0 16px 36px -12px rgb(0 0 0 / 0.12);
}

.nav-popover :deep(a),
.nav-popover :deep(button) {
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

.nav-popover :deep(a.is-current) {
  background: var(--nav-hover);
  color: var(--color-primary);
  font-weight: 600;
}

.account-popover {
  width: 16rem;
  padding: 0;
  overflow: hidden;
}

.account-identity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--nav-line);
}

.account-copy {
  min-width: 0;
}

.account-name {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
}

.account-meta {
  margin: 0.1rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-faint);
  font-size: 0.75rem;
}

.avatar-fallback {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--nav-hover);
}

.account-popover .menu {
  padding: 0.375rem;
}

.sign-out {
  color: var(--color-error);
}

.mobile-layer {
  position: fixed;
  inset: 0;
  z-index: 45;
  pointer-events: none;
}

.mobile-layer.is-open {
  pointer-events: auto;
}

.mobile-scrim {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--color-base-100) 50%, transparent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 200ms ease;
}

.mobile-layer.is-open .mobile-scrim {
  opacity: 1;
}

.mobile-sheet {
  position: absolute;
  inset-inline: 0.75rem;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border-radius: 1.25rem;
  background: color-mix(in oklab, var(--color-base-100) 86%, transparent);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid color-mix(in oklab, var(--color-line-soft) 60%, transparent);
  box-shadow: 0 20px 45px -12px rgb(0 0 0 / 0.4);
  opacity: 0;
  transform: translateY(-0.75rem) scale(0.98);
  transform-origin: top center;
  transition:
    opacity 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

:global([data-theme="stargate-light"]) .mobile-sheet {
  background: color-mix(in oklab, var(--color-base-100) 90%, transparent);
  box-shadow: 0 20px 40px -12px rgb(0 0 0 / 0.14);
}

.mobile-layer.is-open .mobile-sheet {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.mobile-sheet-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
}

.sheet-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.75rem;
  color: var(--nav-quiet);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.sheet-ico {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  opacity: 0.8;
}

.sheet-link:hover,
.sheet-link:focus-visible {
  color: var(--nav-ink);
  background: var(--nav-hover);
}

.sheet-link.is-active {
  color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 14%, transparent);
}

.sheet-link.is-active .sheet-ico {
  color: var(--color-primary);
  opacity: 1;
}

.sheet-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.sheet-foot {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-line-soft);
}

@media (min-width: 768px) {
  .desktop-nav {
    display: block;
  }

  .menu-toggle,
  .mobile-layer {
    display: none;
  }

  .locale-btn {
    display: inline-flex;
  }

  .locale-code {
    display: inline;
  }

  .brand-glyph {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>
