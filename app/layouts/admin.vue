<script setup lang="ts">
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  Globe,
  LogOut,
  ChevronLeft,
} from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

const navItems = [
  { icon: LayoutDashboard, labelEn: 'Dashboard', labelZh: '仪表盘', to: '/administration' },
  { icon: FileText, labelEn: 'Submissions', labelZh: '提交管理', to: '/administration/submissions' },
  { icon: Globe, labelEn: 'Sites', labelZh: '站点管理', to: '/administration/sites' },
  { icon: Users, labelEn: 'Users', labelZh: '用户管理', to: '/administration/users' },
  { icon: User, labelEn: 'Identities', labelZh: '身份管理', to: '/administration/identities' },
]
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Top Bar -->
    <header class="border-b border-base-300 bg-base-100 sticky top-0 z-50">
      <div class="flex items-center justify-between px-6 h-14">
        <div class="flex items-center gap-4">
          <NuxtLink :to="localePath('/icp')" class="btn btn-ghost btn-sm gap-2">
            <ChevronLeft class="w-4 h-4" />
            {{ isZh ? '返回前台' : 'Back to Site' }}
          </NuxtLink>
          <div class="divider divider-horizontal h-6" />
          <h1 class="font-bold text-sm">
            {{ isZh ? '中羊网备管理' : 'ROY ICP Admin' }}
          </h1>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-56 border-r border-base-300 min-h-[calc(100vh-3.5rem)] p-4">
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="localePath(item.to)"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
            active-class="bg-primary/10 text-primary font-medium"
            :class="'hover:bg-base-200'"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ isZh ? item.labelZh : item.labelEn }}
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
