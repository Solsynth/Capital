<script setup lang="ts">
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  Globe,
  ChevronLeft,
  Shield,
  GitPullRequest,
  FileCheck,
  Trophy,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

interface NavItem {
  icon: any
  labelEn: string
  labelZh: string
  to: string
}

interface NavSection {
  titleEn: string
  titleZh: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    titleEn: 'Overview',
    titleZh: '概览',
    items: [
      { icon: LayoutDashboard, labelEn: 'Dashboard', labelZh: '仪表盘', to: '/admin' },
    ],
  },
  {
    titleEn: 'ICP',
    titleZh: '网备',
    items: [
      { icon: FileText, labelEn: 'Submissions', labelZh: '提交管理', to: '/admin/submissions' },
      { icon: Globe, labelEn: 'Sites', labelZh: '站点管理', to: '/admin/sites' },
      { icon: User, labelEn: 'Identities', labelZh: '身份管理', to: '/admin/identities' },
    ],
  },
  {
    titleEn: 'System',
    titleZh: '系统',
    items: [
      { icon: Users, labelEn: 'Users', labelZh: '用户管理', to: '/admin/users' },
    ],
  },
  {
    titleEn: 'Contributions',
    titleZh: '贡献',
    items: [
      { icon: GitPullRequest, labelEn: 'Contributions', labelZh: '贡献管理', to: '/admin/contributions' },
      { icon: FileCheck, labelEn: 'CLA Signatures', labelZh: 'CLA 签署', to: '/admin/contributions/cla' },
    ],
  },
  {
    titleEn: 'Contests',
    titleZh: '竞赛',
    items: [
      { icon: Trophy, labelEn: 'Contests', labelZh: '竞赛管理', to: '/admin/contests' },
      { icon: FileText, labelEn: 'All Submissions', labelZh: '所有提交', to: '/admin/contests/submissions' },
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Top Bar -->
    <header class="border-b border-base-300 bg-base-100 sticky top-0 z-50">
      <div class="flex items-center justify-between px-6 h-14">
        <div class="flex items-center gap-4">
          <NuxtLink :to="localePath('/')" class="btn btn-ghost btn-sm gap-2">
            <ChevronLeft class="w-4 h-4" />
            {{ isZh ? '返回前台' : 'Back to Site' }}
          </NuxtLink>
          <div class="divider divider-horizontal h-6" />
          <div class="flex items-center gap-2">
            <Shield class="w-4 h-4 text-primary" />
            <h1 class="font-bold text-sm">
              {{ isZh ? '管理后台' : 'Admin Panel' }}
            </h1>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-56 border-r border-base-300 min-h-[calc(100vh-3.5rem)] p-4">
        <nav class="space-y-4">
          <div v-for="section in navSections" :key="section.titleEn">
            <p class="px-3 mb-1 text-xs font-semibold uppercase opacity-50">
              {{ isZh ? section.titleZh : section.titleEn }}
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
                {{ isZh ? item.labelZh : item.labelEn }}
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
