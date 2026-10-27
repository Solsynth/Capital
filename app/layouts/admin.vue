<script setup lang="ts">
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  Globe,
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
  <div class="admin">
    <header class="admin-bar">
      <div class="admin-bar-inner">
        <NuxtLink :to="localePath('/')" class="admin-home" :aria-label="t('nav.brandName')">
          <img src="/favicon.png" alt="" class="brand-mark admin-glyph" width="20" height="20">
          <span class="admin-brand">Solsynth</span>
        </NuxtLink>

        <span class="admin-sep" aria-hidden="true">/</span>
        <h1 class="admin-title">
          {{ t("admin.panel.title") }}
        </h1>

        <NuxtLink :to="localePath('/')" class="admin-exit">
          {{ t("admin.panel.exit") }}
        </NuxtLink>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-rail">
        <nav class="admin-nav" :aria-label="t('admin.panel.title')">
          <div v-for="section in navSections" :key="section.title" class="admin-group">
            <p class="admin-group-title">
              {{ section.title }}
            </p>
            <NuxtLink
              v-for="item in section.items"
              :key="item.to"
              :to="localePath(item.to)"
              class="admin-link"
              active-class="is-active"
            >
              <component :is="item.icon" class="admin-icon" aria-hidden="true" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100dvh;
  background: var(--color-base-100);
}

.admin-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--color-line);
  background: color-mix(in oklab, var(--color-base-100) 88%, transparent);
  backdrop-filter: blur(14px);
}

.admin-bar-inner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  height: 3.25rem;
  padding-inline: 1.25rem;
}

.admin-home {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-base-content);
  text-decoration: none;
}

.admin-glyph {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-base-content);
}

.admin-brand {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.admin-sep {
  color: var(--color-line);
}

.admin-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-faint);
}

.admin-exit {
  margin-left: auto;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.admin-exit:hover,
.admin-exit:focus-visible {
  color: var(--color-base-content);
}

.admin-body {
  display: flex;
  align-items: stretch;
  min-height: calc(100dvh - 3.25rem);
}

.admin-rail {
  display: none;
  width: 13.5rem;
  flex-shrink: 0;
  border-right: 1px solid var(--color-line-soft);
  padding: 1.25rem 0.75rem;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.admin-group-title {
  margin: 0 0 0.35rem;
  padding-inline: 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-faint);
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-mark);
  font-size: 0.8125rem;
  color: var(--color-dim);
  text-decoration: none;
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

.admin-link:hover {
  background: color-mix(in oklab, var(--color-base-300) 55%, transparent);
  color: var(--color-base-content);
}

.admin-link.is-active {
  background: color-mix(in oklab, var(--color-primary) 16%, transparent);
  color: var(--color-primary);
  font-weight: 600;
}

.admin-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  flex-shrink: 0;
}

.admin-main {
  flex: 1;
  min-width: 0;
  padding: 1.5rem 1.25rem 4rem;
}

@media (min-width: 900px) {
  .admin-rail {
    display: block;
  }

  .admin-bar-inner {
    padding-inline: 1.75rem;
  }

  .admin-main {
    padding: 1.75rem 2rem 4rem;
  }
}
</style>
