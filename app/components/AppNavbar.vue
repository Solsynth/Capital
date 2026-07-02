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
  Trophy,
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
  { to: localePath("/"), label: t("nav.explore"), icon: Compass },
  { to: localePath("/products"), label: t("nav.products"), icon: Layers },
  { to: localePath("/contests"), label: t("nav.contests"), icon: Trophy },
  { to: localePath("/updates"), label: t("nav.updates"), icon: Newspaper },
]);

const isMobileMenuOpen = ref(false);
const isDark = ref(false);
const themeMode = ref<"auto" | "light" | "dark">("auto");

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: "auto" | "light" | "dark") {
  if (import.meta.server) return;
  const resolved = mode === "auto" ? getSystemTheme() : mode;
  document.documentElement.setAttribute("data-theme", resolved);
  isDark.value = resolved === "dark";
}

function syncTheme() {
  if (import.meta.server) return;
  const stored = localStorage.getItem("theme") as
    "auto" | "light" | "dark" | null;
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
  document.body.style.overflow = "";
}

function openMobileMenu() {
  isMobileMenuOpen.value = true;
  document.body.style.overflow = "hidden";
}

function toggleMobileMenu() {
  if (isMobileMenuOpen.value) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function getLocalizedPath(targetLang: string): string {
  const pathWithoutLang = pathname.value.replace(/^\/(en|zh)/, "");
  return `/${targetLang}${pathWithoutLang || "/"}`;
}

const languageNames: Record<string, string> = {
  en: "English",
  zh: "中文",
};

onMounted(() => {
  syncTheme();

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (themeMode.value === "auto") {
        applyTheme("auto");
      }
    });

  document.querySelectorAll("#mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });
});
</script>

<template>
  <header
    id="site-navbar"
    class="fixed left-0 right-0 z-40 overflow-visible"
    :style="{ top: `calc(${bannerHeight})` }"
  >
    <div class="navbar-glass">
      <!-- Brand -->
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center gap-2 shrink-0 ms-4"
      >
        <img src="/favicon.png" :alt="t('nav.brandName')" class="w-8 h-8" />
        <span class="font-bold text-lg hidden sm:inline">{{
          t("nav.brandName")
        }}</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav
        class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <ul class="flex items-center gap-1">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="nav-link"
              active-class="!bg-base-content/10 !text-base-content"
            >
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Actions -->
      <div class="relative z-50 flex items-center gap-1 shrink-0 md:me-4">
        <div class="dropdown dropdown-end z-50">
          <div
            tabindex="0"
            role="button"
            class="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
          >
            <Languages class="w-5 h-5" />
            <span class="hidden sm:inline">{{ languageNames[lang] }}</span>
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu z-100 w-40 rounded-2xl border border-base-content/10 bg-base-100/80 p-2 shadow-xl shadow-black/10 backdrop-blur-2xl dark:border-base-content/5 dark:bg-base-100/60"
          >
            <li v-for="l in locales" :key="typeof l === 'string' ? l : l.code">
              <NuxtLink
                :to="getLocalizedPath(typeof l === 'string' ? l : l.code)"
                :class="{
                  active: (typeof l === 'string' ? l : l.code) === lang,
                }"
                class="rounded-xl"
              >
                {{ typeof l === "string" ? languageNames[l] || l : l.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Logged in: user dropdown -->
        <div v-if="session?.user" class="dropdown dropdown-end z-50">
          <div
            tabindex="0"
            role="button"
            class="flex items-center justify-center rounded-full w-9 h-9 text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
          >
            <img
              v-if="solarAvatar"
              :src="solarAvatar"
              :alt="session.user.name"
              class="w-7 h-7 rounded-full object-cover"
            />
            <img
              v-else-if="session.user.image"
              :src="session.user.image"
              :alt="session.user.name"
              class="w-5 h-5 rounded-full object-cover"
            />
            <CircleUser v-else class="w-5 h-5" />
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu z-100 w-48 rounded-2xl border border-base-content/10 bg-base-100/80 p-2 shadow-xl shadow-black/10 backdrop-blur-2xl dark:border-base-content/5 dark:bg-base-100/60"
          >
            <li>
              <NuxtLink
                :to="localePath('/auth/profile')"
                class="rounded-xl gap-2"
                @click.stop
              >
                <UserRound class="w-4 h-4" />
                {{ t("nav.profile", "Profile") }}
              </NuxtLink>
            </li>
            <li>
              <button
                class="rounded-xl gap-2"
                @click.stop="useAuth().signOut()"
              >
                <LogOut class="w-4 h-4" />
                {{ t("nav.signOut", "Sign out") }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Logged out: login link -->
        <NuxtLink
          v-else
          :to="localePath('/auth/login')"
          class="flex items-center justify-center rounded-full w-9 h-9 text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
        >
          <CircleUser class="w-5 h-5" />
        </NuxtLink>

        <button
          class="flex items-center justify-center rounded-full w-9 h-9 text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
          :title="
            themeMode === 'auto'
              ? 'Auto (System)'
              : themeMode === 'dark'
                ? 'Dark'
                : 'Light'
          "
          @click="cycleTheme"
        >
          <Monitor v-if="themeMode === 'auto'" class="w-5 h-5" />
          <Sun v-else-if="themeMode === 'dark'" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <button
          class="relative flex items-center justify-center rounded-full w-9 h-9 text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content md:hidden"
          @click="toggleMobileMenu"
        >
          <Menu
            class="w-5 h-5 absolute transition-all duration-200"
            :class="
              isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
            "
          />
          <X
            class="w-5 h-5 absolute transition-all duration-200"
            :class="
              isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
            "
          />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Menu Panel -->
  <div
    id="mobile-menu"
    class="fixed inset-0 z-40 pointer-events-none md:hidden"
  >
    <div
      class="absolute inset-0 bg-base-300/60 backdrop-blur-sm opacity-0 transition-opacity duration-300"
      :class="{ 'pointer-events-auto': isMobileMenuOpen }"
      :style="{ opacity: isMobileMenuOpen ? 1 : 0 }"
      @click="closeMobileMenu"
    />
    <div
      class="absolute left-5 right-5 rounded-2xl border border-base-content/10 bg-base-100/70 p-3 shadow-xl shadow-black/10 backdrop-blur-2xl transition-all duration-300 dark:border-base-content/5 dark:bg-base-100/50"
      :class="{
        'pointer-events-auto': isMobileMenuOpen,
        'pointer-events-none': !isMobileMenuOpen,
      }"
      :style="{
        top: `calc(${bannerHeight} + 96px)`,
        opacity: isMobileMenuOpen ? 1 : 0,
        transform: isMobileMenuOpen
          ? 'translateY(0) scale(1)'
          : 'translateY(-0.5rem) scale(0.98)',
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

<style scoped>
.navbar-glass {
  position: relative;
  display: flex;
  height: 4rem; /* md:h-16 */
  padding-inline: 1.5rem; /* md:px-6 */
  align-items: center;
  justify-content: space-between;
  padding-inline: 1rem; /* px-4 */
  background-color: color-mix(in srgb, var(--color-base-100) 60%, transparent);
  box-shadow:
    var(--tw-shadow, 0 0 #0000), var(--tw-shadow-colored, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000);
  --tw-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored:
    0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --tw-shadow-color: rgb(0 0 0 / 0.05);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -10;
    backdrop-filter: blur(40px);
  }
}

:global(.dark) .navbar-glass {
  background-color: color-mix(in srgb, var(--color-base-100) 40%, transparent);
  border-color: color-mix(in srgb, var(--color-base-content) 5%, transparent);
  --tw-shadow-color: rgb(0 0 0 / 0.2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--color-base-content) 70%, transparent);
  transition: all 0.2s;

  &:hover {
    background-color: color-mix(
      in srgb,
      var(--color-base-content) 5%,
      transparent
    );
    color: var(--color-base-content);
  }
}
</style>
