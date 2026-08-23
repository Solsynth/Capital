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

const props = withDefaults(defineProps<Props>(), { bannerHeight: "20px" });

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

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: "auto" | "light" | "dark") {
  if (import.meta.server) return;
  const resolved = mode === "auto" ? getSystemTheme() : mode;
  document.documentElement.setAttribute("data-theme", resolved);
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
  () => closeMobileMenu(),
);

onMounted(() => {
  syncTheme();
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onSystemThemeChange);
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", onSystemThemeChange);
  window.removeEventListener("keydown", onKeydown);
  closeMobileMenu();
});
</script>

<template>
  <header
    id="site-navbar"
    class="site-navbar"
    :class="{ 'is-open': isMobileMenuOpen }"
    :style="{ top: `calc(${props.bannerHeight})` }"
  >
    <div class="nav-bar">
      <div class="nav-cluster">
        <NuxtLink
          :to="localePath('/')"
          class="brand"
          :aria-label="t('nav.brandName')"
        >
          <img src="/favicon-64.png" alt="" class="brand-mark" width="24" height="24">
          <span class="brand-name">{{ t("nav.brandName") }}</span>
        </NuxtLink>

        <nav class="desktop-nav" :aria-label="t('nav.brandName')">
          <ul>
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="nav-link"
                :active-class="item.exact ? undefined : 'is-active'"
                exact-active-class="is-active"
              >
                <component :is="item.icon" class="nav-ico" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="nav-actions">
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            type="button"
            class="nav-btn locale-btn"
            :aria-label="languageNames[lang] || lang"
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
          <CircleUser class="icon sign-in-icon" />
          <span class="sign-in-label">{{ t("login.title") }}</span>
        </NuxtLink>

        <button
          type="button"
          class="nav-btn"
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
      :style="{ top: `calc(${props.bannerHeight} + 4rem)` }"
      :aria-hidden="!isMobileMenuOpen"
    >
      <ul>
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="sheet-link"
            :active-class="item.exact ? undefined : 'is-active'"
            exact-active-class="is-active"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" class="sheet-ico" />
            {{ item.label }}
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
          {{ t("nav.profile") }}
        </NuxtLink>
        <NuxtLink
          v-else
          :to="localePath('/auth/login')"
          class="sheet-link"
          @click="closeMobileMenu"
        >
          <CircleUser class="sheet-ico" />
          {{ t("login.title") }}
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.site-navbar {
  --nav-h: 4rem;
  --nav-ink: var(--color-base-content);
  --nav-quiet: color-mix(in srgb, var(--color-base-content) 48%, transparent);
  --nav-line: color-mix(in srgb, var(--color-base-content) 10%, transparent);
  --nav-veil: color-mix(in srgb, var(--color-base-100) 72%, transparent);
  --nav-hover: color-mix(in srgb, var(--color-base-content) 5%, transparent);
  --nav-mark: var(--color-primary);

  position: fixed;
  inset-inline: 0;
  z-index: 40;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-h);
  padding-inline: 1.25rem;
  background: var(--nav-veil);
  border-bottom: 1px solid var(--nav-line);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
}

.site-navbar.is-open .nav-bar {
  background: var(--color-base-100);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.nav-cluster {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 1.75rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--nav-ink);
  text-decoration: none;
  outline: none;
}

.brand:focus-visible {
  border-radius: 0.25rem;
  outline: 2px solid var(--nav-mark);
  outline-offset: 4px;
}

.brand-mark {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.brand-name {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.desktop-nav {
  display: none;
}

.desktop-nav ul {
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: var(--nav-h);
  color: var(--nav-quiet);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-ico {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
  opacity: 0.82;
}

.nav-link.is-active .nav-ico,
.nav-link:hover .nav-ico {
  opacity: 1;
}

.nav-link:hover,
.nav-link:focus-visible {
  color: var(--nav-ink);
}

.nav-link.is-active {
  color: var(--nav-ink);
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -1px;
  width: 0;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transform: translateX(-50%);
  transition: width 0.22s ease;
}

.nav-link.is-active::after {
  width: 1.25rem;
}
.nav-link:focus-visible {
  outline: 2px solid var(--nav-mark);
  outline-offset: 4px;
  border-radius: 0.15rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
}

.nav-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--nav-quiet);
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.nav-btn:hover,
.nav-btn:focus-visible {
  color: var(--nav-ink);
  background: var(--nav-hover);
}

.nav-btn:focus-visible {
  outline: 2px solid var(--nav-mark);
  outline-offset: 2px;
}

.locale-btn {
  width: auto;
  min-width: 2.25rem;
  gap: 0.3rem;
  padding-inline: 0.55rem;
}

.locale-code {
  display: none;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.icon {
  width: 1.125rem;
  height: 1.125rem;
}

.icon.muted {
  color: var(--nav-quiet);
}

.sign-in {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 2.25rem;
  height: 2.25rem;
  padding-inline: 0.7rem;
  border-radius: 999px;
  color: var(--nav-quiet);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.sign-in-label {
  display: none;
}

.sign-in:hover,
.sign-in:focus-visible {
  color: var(--nav-ink);
  background: var(--nav-hover);
}

.sign-in:focus-visible {
  outline: 2px solid var(--nav-mark);
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
    opacity 0.18s ease,
    transform 0.18s ease;
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
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-img.lg {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
}

.avatar-btn {
  overflow: hidden;
}

.nav-popover {
  z-index: 100;
  margin-top: 0.4rem;
  padding: 0.35rem;
  min-width: 10.5rem;
  border: 1px solid var(--nav-line);
  border-radius: 0.75rem;
  background: var(--color-base-100);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-base-content) 6%, transparent);
  color: var(--nav-ink);
}

.nav-popover :deep(a),
.nav-popover :deep(button) {
  border-radius: 0.45rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.nav-popover :deep(a.is-current) {
  background: var(--nav-hover);
  font-weight: 600;
}

.account-popover {
  width: 15.5rem;
  padding: 0;
  overflow: hidden;
}

.account-identity {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 0.95rem 0.8rem;
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
  color: var(--nav-quiet);
  font-size: 0.75rem;
}

.avatar-fallback {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--nav-hover);
}

.account-popover .menu {
  padding: 0.35rem;
}

.sign-out {
  color: var(--color-error);
}

.mobile-layer {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
}

.mobile-layer.is-open {
  pointer-events: auto;
}

.mobile-scrim {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-base-100) 35%, transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.mobile-layer.is-open .mobile-scrim {
  opacity: 1;
}

.mobile-sheet {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1.25rem 2rem;
  background: var(--color-base-100);
  border-top: 1px solid var(--nav-line);
  opacity: 0;
  transform: translateY(-0.4rem);
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.mobile-layer.is-open .mobile-sheet {
  opacity: 1;
  transform: translateY(0);
}

.mobile-sheet ul {
  margin: 0;
  padding: 0.5rem 0;
  list-style: none;
}

.sheet-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 3.25rem;
  color: var(--nav-quiet);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
  text-decoration: none;
  transition: color 0.2s ease;
}

.sheet-ico {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.sheet-link.is-active .sheet-ico,
.sheet-link:hover .sheet-ico {
  opacity: 1;
}

.sheet-link:hover,
.sheet-link:focus-visible,
.sheet-link.is-active {
  color: var(--nav-ink);
}

.sheet-link:focus-visible {
  outline: 2px solid var(--nav-mark);
  outline-offset: 4px;
  border-radius: 0.2rem;
}

.sheet-foot {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--nav-line);
}

.sheet-foot .sheet-link {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .nav-bar {
    padding-inline: 1.75rem;
  }

  .desktop-nav {
    display: block;
  }

  .menu-toggle,
  .mobile-layer {
    display: none;
  }

  .sign-in-label,
  .locale-code {
    display: inline;
  }
}

@media (min-width: 1024px) {
  .nav-bar {
    padding-inline: 2.25rem;
  }

  .nav-cluster {
    gap: 2.5rem;
  }

  .desktop-nav ul {
    gap: 2rem;
  }
}

:global([data-theme="dark"]) .site-navbar {
  --nav-veil: color-mix(in srgb, var(--color-base-100) 55%, transparent);
  --nav-line: color-mix(in srgb, var(--color-base-content) 12%, transparent);
}
</style>
