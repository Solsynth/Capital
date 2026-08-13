<script setup lang="ts">
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  Globe,
  Home,
  Shield,
  GitPullRequest,
  FileCheck,
  Trophy,
  MessageSquare,
} from "@lucide/vue";

const { t } = useI18n();
const localePath = useLocalePath();

interface NavItem {
  icon: any;
  label: string;
  to: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections = computed<NavSection[]>(() => [
  {
    title: t("admin.nav.overview"),
    items: [
      { icon: LayoutDashboard, label: t("admin.nav.dashboard"), to: "/admin" },
    ],
  },
  {
    title: t("admin.nav.icp"),
    items: [
      {
        icon: FileText,
        label: t("admin.nav.submissions"),
        to: "/admin/submissions",
      },
      { icon: Globe, label: t("admin.nav.sites"), to: "/admin/sites" },
      { icon: User, label: t("admin.nav.identities"), to: "/admin/identities" },
    ],
  },
  {
    title: t("admin.nav.system"),
    items: [{ icon: Users, label: t("admin.nav.users"), to: "/admin/users" }],
  },
  {
    title: t("admin.nav.contributions"),
    items: [
      {
        icon: GitPullRequest,
        label: t("admin.nav.contributionsManage"),
        to: "/admin/contributions",
      },
      {
        icon: FileCheck,
        label: t("admin.nav.claSignatures"),
        to: "/admin/contributions/cla",
      },
    ],
  },
  {
    title: t("admin.nav.contests"),
    items: [
      {
        icon: Trophy,
        label: t("admin.nav.contestsManage"),
        to: "/admin/contests",
      },
      {
        icon: FileText,
        label: t("admin.nav.allSubmissions"),
        to: "/admin/contests/submissions",
      },
    ],
  },
  {
    title: t("reviews.title"),
    items: [
      {
        icon: MessageSquare,
        label: t("reviews.title"),
        to: "/admin/reviews",
      },
    ],
  },
]);
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Top Bar -->
    <header class="border-b border-base-300 bg-base-100 sticky top-0 z-50">
      <div class="flex items-center justify-between px-6 h-14">
        <div class="flex items-center gap-4">
          <NuxtLink
            :to="localePath('/')"
            class="btn btn-ghost btn-circle btn-sm gap-2"
          >
            <Home class="w-4 h-4" />
          </NuxtLink>
          <div class="flex items-center gap-2">
            <Shield class="w-4 h-4 text-primary" />
            <h1 class="font-bold text-sm">
              {{ t("admin.panel.title") }}
            </h1>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        class="w-56 border-r border-base-300 min-h-[calc(100vh-3.5rem)] p-4"
      >
        <nav class="space-y-4">
          <div v-for="section in navSections" :key="section.title">
            <p class="px-3 mb-1 text-xs font-semibold uppercase opacity-50">
              {{ section.title }}
            </p>
            <div class="space-y-0.5">
              <NuxtLink
                v-for="item in section.items"
                :key="item.to"
                :to="localePath(item.to)"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                active-class="bg-primary/10 text-primary font-medium"
                :class="'hover:bg-base-200'"
              >
                <component :is="item.icon" class="w-4 h-4" />
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
