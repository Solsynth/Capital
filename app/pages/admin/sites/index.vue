<script setup lang="ts">
import {
  Globe,
  ExternalLink,
  Search,
  Edit,
  Check,
  RefreshCw,
} from '@lucide/vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed(() => locale.value)
const isZh = computed(() => lang.value === 'zh')

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: computed(() => isZh.value ? '站点管理' : 'Sites') })

interface Site {
  id: string
  filling_no: string
  domain: string
  name: string
  description?: string
  site_url: string
  icon?: string
  iconFileId?: string | null
  approved: boolean
  iconUrl: string | null
}

const { data: sitesData, refresh } = await useAsyncData(
  'admin-sites',
  () => $fetch<{ sites: Site[] }>('/api/icp/sites'),
)

const sites = computed(() => sitesData.value?.sites ?? [])

const searchQuery = ref('')
const filteredSites = computed(() => {
  if (!searchQuery.value.trim()) return sites.value
  const q = searchQuery.value.toLowerCase()
  return sites.value.filter(s =>
    s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q),
  )
})

// Edit dialog
const editingSite = ref<Site | null>(null)
const editForm = reactive({
  name: '',
  domain: '',
  description: '',
  siteUrl: '',
  iconFileId: null as string | null,
  iconUrl: null as string | null,
})
const isSaving = ref(false)

function startEdit(site: Site) {
  editingSite.value = site
  editForm.name = site.name
  editForm.domain = site.domain
  editForm.description = site.description || ''
  editForm.siteUrl = site.site_url
  editForm.iconFileId = site.iconFileId || null
  editForm.iconUrl = site.icon || site.iconUrl || null
}

function handleIconUploaded(fileId: string, url: string) {
  editForm.iconFileId = fileId
  editForm.iconUrl = url
}

function handleIconRemoved() {
  editForm.iconFileId = null
  editForm.iconUrl = null
}

async function saveEdit() {
  if (!editingSite.value || isSaving.value) return
  isSaving.value = true
  try {
    await $fetch(`/api/admin/icp/sites/${editingSite.value.id}`, {
      method: 'PATCH',
      body: {
        name: editForm.name,
        domain: editForm.domain,
        description: editForm.description || null,
        siteUrl: editForm.siteUrl,
        iconFileId: editForm.iconFileId,
        icon: editForm.iconUrl,
      },
    })
    editingSite.value = null
    await refresh()
  }
  catch (err: any) {
    alert(err.data?.statusMessage || (isZh.value ? '保存失败' : 'Save failed'))
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h2 class="admin-h">
          {{ isZh ? '站点管理' : 'Sites' }}
        </h2>
        <p class="admin-sub">
          {{ isZh ? '已备案的站点及其认证状态。' : 'Certified sites and their review state.' }}
        </p>
      </div>
      <button class="btn btn-sm" @click="refresh()">
        <RefreshCw class="btn-icon" aria-hidden="true" />
        {{ isZh ? '刷新' : 'Refresh' }}
      </button>
    </div>

    <div class="search">
      <Search class="search-icon" aria-hidden="true" />
      <input
        v-model="searchQuery"
        type="search"
        class="input search-input"
        :placeholder="isZh ? '搜索站点…' : 'Search sites…'"
      >
    </div>

    <AppDialog
      :open="!!editingSite"
      :title="isZh ? '编辑站点' : 'Edit site'"
      max-width="max-w-md"
      @update:open="!$event && (editingSite = null)"
    >
      <div class="form-stack">
        <div>
          <span class="field-label">{{ isZh ? '图标' : 'Icon' }}</span>
          <IconUpload
            :current-icon="editForm.iconUrl"
            folder="icp/sites"
            @uploaded="handleIconUploaded"
            @removed="handleIconRemoved"
          />
        </div>
        <label>
          <span class="field-label">{{ isZh ? '站点名称' : 'Site name' }}</span>
          <input v-model="editForm.name" type="text" class="input" required>
        </label>
        <label>
          <span class="field-label">{{ isZh ? '域名' : 'Domain' }}</span>
          <input v-model="editForm.domain" type="text" class="input" required>
        </label>
        <label>
          <span class="field-label">{{ isZh ? '网站链接' : 'Site URL' }}</span>
          <input v-model="editForm.siteUrl" type="url" class="input" required>
        </label>
        <label>
          <span class="field-label">{{ isZh ? '介绍' : 'Description' }}</span>
          <textarea v-model="editForm.description" class="textarea h-20" />
        </label>
      </div>
      <template #footer>
        <button class="btn" @click="editingSite = null">
          {{ isZh ? '取消' : 'Cancel' }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="isSaving || !editForm.name || !editForm.domain || !editForm.siteUrl"
          @click="saveEdit"
        >
          <span v-if="isSaving" class="loading loading-spinner loading-xs" />
          <Check v-else class="btn-icon" aria-hidden="true" />
          {{ isZh ? '保存' : 'Save' }}
        </button>
      </template>
    </AppDialog>

    <div v-if="filteredSites.length" class="table-wrap">
      <table class="ledger">
        <thead>
          <tr>
            <th>{{ isZh ? '站点名称' : 'Site' }}</th>
            <th>{{ isZh ? '域名' : 'Domain' }}</th>
            <th>{{ isZh ? '备案号' : 'Filling no' }}</th>
            <th>{{ isZh ? '状态' : 'Status' }}</th>
            <th>{{ isZh ? '操作' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in filteredSites" :key="site.id">
            <td>
              <div class="entity">
                <span class="entity-mark">
                  <img v-if="site.iconUrl" :src="site.iconUrl" :alt="site.name">
                  <Globe v-else class="entity-icon" aria-hidden="true" />
                </span>
                <span class="entity-text">
                  <span class="entity-name">{{ site.name }}</span>
                  <span v-if="site.description" class="entity-sub">{{ site.description }}</span>
                </span>
              </div>
            </td>
            <td class="mono">
              {{ site.domain }}
            </td>
            <td class="mono">
              {{ site.filling_no }}
            </td>
            <td>
              <span class="status" :class="site.approved ? 'status-ok' : 'status-warn'">
                <span class="dot" aria-hidden="true" />
                {{ site.approved ? (isZh ? '已认证' : 'Certified') : (isZh ? '待审核' : 'Pending') }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-xs" :title="isZh ? '编辑' : 'Edit'" @click="startEdit(site)">
                  <Edit class="btn-icon" aria-hidden="true" />
                </button>
                <NuxtLink
                  :to="localePath(`/icp/${site.filling_no}`)"
                  class="btn btn-xs"
                  :title="isZh ? '查看' : 'View'"
                >
                  <ExternalLink class="btn-icon" aria-hidden="true" />
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty">
      {{ searchQuery
        ? (isZh ? '没有匹配的站点。清空搜索以查看全部。' : 'No sites match that search. Clear the search to see them all.')
        : (isZh ? '暂无站点。' : 'No sites yet.')
      }}
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

.search {
  position: relative;
  max-width: 22rem;
  margin-bottom: 1.25rem;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-faint);
  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  padding-left: 2.15rem;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.table-wrap {
  overflow-x: auto;
}

.entity {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 11rem;
}

.entity-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-mark);
  background: var(--color-base-300);
}

.entity-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.entity-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-faint);
}

.entity-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  font-size: 0.8125rem;
}

.entity-name {
  font-weight: 600;
  color: var(--color-base-content);
}

.entity-sub {
  overflow: hidden;
  max-width: 16rem;
  font-size: 0.75rem;
  color: var(--color-faint);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status .dot {
  background: currentColor;
}

.status-ok {
  color: var(--color-success);
}

.status-warn {
  color: var(--color-warning);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.3rem;
}

.empty {
  margin: 0;
  padding: 1.5rem 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}
</style>
