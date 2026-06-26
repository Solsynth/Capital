<script setup lang="ts">
import { FileCheck, Loader2, RefreshCw, ExternalLink } from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: computed(() => isZh.value ? 'CLA 签署记录' : 'CLA Signatures') })

const { data, status, refresh } = await useAsyncData('admin-cla-sigs', () =>
  $fetch<any>('/api/admin/contrib/cla'),
)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        {{ isZh ? 'CLA 签署记录' : 'CLA Signatures' }}
      </h2>
      <button class="btn btn-sm btn-ghost gap-2" @click="refresh()">
        <RefreshCw class="w-4 h-4" />
        {{ isZh ? '刷新' : 'Refresh' }}
      </button>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="data?.signatures?.length" class="card bg-base-200/60 border border-base-content/5 overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr class="text-xs opacity-60">
            <th>GitHub</th>
            <th>{{ isZh ? '用户 ID' : 'User ID' }}</th>
            <th>{{ isZh ? 'CLA 版本' : 'CLA Version' }}</th>
            <th>{{ isZh ? '签署时间' : 'Signed At' }}</th>
            <th>{{ isZh ? 'GitHub 主页' : 'Profile' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sig in data.signatures" :key="`${sig.githubUserId}-${sig.claVersion}`" class="hover:bg-base-200/50">
            <td class="text-sm font-medium">{{ sig.githubUsername }}</td>
            <td class="text-xs opacity-50 font-mono">{{ sig.userId?.slice(0, 8) }}…</td>
            <td>
              <span class="badge badge-sm" :class="sig.claVersion === data?.currentVersion ? 'badge-success' : 'badge-ghost'">
                {{ sig.claVersion }}
              </span>
            </td>
            <td class="text-xs opacity-70">{{ new Date(sig.signedAt).toLocaleString() }}</td>
            <td>
              <a
                :href="`https://github.com/${sig.githubUsername}`"
                target="_blank"
                rel="noopener"
                class="link link-primary text-xs"
              >
                <ExternalLink class="w-3 h-3 inline" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-16 opacity-50">
      {{ isZh ? '暂无签署记录' : 'No signatures yet' }}
    </div>
  </div>
</template>
