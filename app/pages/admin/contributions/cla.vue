<script setup lang="ts">
import { RefreshCw, ExternalLink } from '@lucide/vue'

const { locale } = useI18n()
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
    <div class="head">
      <div>
        <h2 class="admin-h">
          {{ isZh ? 'CLA 签署记录' : 'CLA signatures' }}
        </h2>
        <p class="admin-sub">
          {{ isZh ? '每个 GitHub 账号的贡献者许可协议签署记录。' : 'Contributor licence agreements signed per GitHub account.' }}
        </p>
      </div>
      <button class="btn btn-sm" @click="refresh()">
        <RefreshCw class="btn-icon" aria-hidden="true" />
        {{ isZh ? '刷新' : 'Refresh' }}
      </button>
    </div>

    <div v-if="status === 'pending'" class="loading-rows">
      <span class="skeleton sk-row" />
      <span class="skeleton sk-row" />
      <span class="skeleton sk-row" />
    </div>

    <div v-else-if="data?.signatures?.length" class="table-wrap">
      <table class="ledger">
        <thead>
          <tr>
            <th>GitHub</th>
            <th>{{ isZh ? '用户 ID' : 'User ID' }}</th>
            <th>{{ isZh ? 'CLA 版本' : 'CLA version' }}</th>
            <th>{{ isZh ? '签署时间' : 'Signed at' }}</th>
            <th>{{ isZh ? '主页' : 'Profile' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sig in data.signatures" :key="`${sig.githubUserId}-${sig.claVersion}`">
            <td>{{ sig.githubUsername }}</td>
            <td class="mono">
              {{ sig.userId?.slice(0, 8) }}…
            </td>
            <td>
              <span v-if="sig.claVersion === data?.currentVersion" class="status status-ok">
                <span class="dot" aria-hidden="true" />
                {{ sig.claVersion }}
              </span>
              <span v-else class="mono">{{ sig.claVersion }}</span>
            </td>
            <td class="mono">
              {{ new Date(sig.signedAt).toLocaleString() }}
            </td>
            <td>
              <div class="row-actions">
                <a
                  :href="`https://github.com/${sig.githubUsername}`"
                  target="_blank"
                  rel="noopener"
                  class="link-quiet"
                >
                  <ExternalLink class="btn-icon" aria-hidden="true" />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty">
      {{ isZh ? '暂无签署记录。' : 'No signatures recorded yet.' }}
    </p>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.admin-h {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-sub {
  max-width: 40rem;
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.table-wrap {
  overflow-x: auto;
}

.loading-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sk-row {
  height: 2.25rem;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
}

.status .dot {
  background: currentColor;
}

.status-ok {
  color: var(--color-success);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
}

.empty {
  margin: 0;
  padding: 1.5rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}
</style>
