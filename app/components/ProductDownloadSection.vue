<script setup lang="ts">
import {
  Check,
  ChevronDown,
  ChevronUp,
  CodeXml,
  Copy,
  Download,
  LoaderCircle,
  Tag,
} from "@lucide/vue"
import type {
  ProductDownloadAction,
  ProductDownloadPlatform,
} from "~/types/product-download"
import type { ProductRelease } from "~/composables/useProductReleases"
import { renderMarkdown } from "~/utils/marked"

const { t, locale } = useI18n()

const props = defineProps<{
  release: ProductRelease | null
  releases: ProductRelease[]
  loading?: boolean
  githubUrl: string
  platforms: ProductDownloadPlatform[]
  badgeKey: string
  titleKey: string
  descKey: string
  viewGithubKey: string
  releaseExpandKey: string
  releaseCollapseKey: string
  brewCommand?: string
}>()

const emit = defineEmits<{
  selectRelease: [version: string]
}>()

const activePlatform = ref(props.platforms[0]?.id ?? "")
const releaseExpanded = ref(false)
const copied = ref(false)

const currentPlatform = computed(
  () => props.platforms.find((platform) => platform.id === activePlatform.value) ?? props.platforms[0],
)
const releaseBodyHtml = computed(() => renderMarkdown(props.release?.changelog || ""))
const loadingLabel = computed(() =>
  locale.value === "zh" ? "正在加载下载信息…" : "Loading download information…",
)

const actionRowClass: Record<ProductDownloadAction["variant"], string> = {
  primary:
    "border-primary/25 bg-primary/10 hover:bg-primary/15 text-base-content",
  outline:
    "border-base-content/10 bg-base-100 hover:bg-base-300/60 text-base-content",
  ghost:
    "border-transparent bg-transparent hover:bg-base-300/50 text-base-content/80",
}

function actionArtifact(action: ProductDownloadAction) {
  if (!action.artifactPlatform) return undefined
  return props.release?.artifacts.find((candidate) =>
    candidate.platform === action.artifactPlatform &&
    (!action.artifactArchitecture || candidate.architecture === action.artifactArchitecture),
  )
}

function actionHref(action: ProductDownloadAction): string | undefined {
  if (!action.artifactPlatform) return action.href
  return actionArtifact(action)?.download_url
}

const hasAvailableAction = computed(() =>
  Boolean(currentPlatform.value?.actions.some((action) => actionHref(action))),
)

function formatArtifactSize(size?: number): string | undefined {
  if (size == null || !Number.isFinite(size) || size < 0) return undefined
  const units = ["B", "KB", "MB", "GB", "TB"]
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const digits = unitIndex === 0 || value >= 10 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

function formatArtifactDate(date?: string | null): string | undefined {
  if (!date) return undefined
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toLocaleDateString(locale.value === "zh" ? "zh-CN" : "en-US")
}

function artifactUploadDate(artifact: ReturnType<typeof actionArtifact>): string | undefined {
  return formatArtifactDate(artifact?.uploaded_at || artifact?.created_at)
}

async function copyCommand() {
  if (!props.brewCommand) return
  try {
    await navigator.clipboard.writeText(props.brewCommand)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // clipboard may be unavailable
  }
}
</script>

<template>
  <section id="download" class="container mx-auto px-4 py-16 scroll-mt-24">
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-2 mb-4">
        <span class="badge badge-accent badge-outline">{{ t(props.badgeKey) }}</span>
        <LoaderCircle
          v-if="props.loading"
          class="w-4 h-4 animate-spin text-primary"
          aria-hidden="true"
        />
      </div>
      <h2 class="text-4xl font-bold mb-4">{{ t(props.titleKey) }}</h2>
      <p class="text-lg opacity-70 max-w-2xl mx-auto">{{ t(props.descKey) }}</p>
    </div>
    <div
      v-if="props.loading && !props.release"
      class="mb-8 rounded-xl border border-base-content/5 bg-base-200 px-5 py-8 flex items-center justify-center gap-3 text-sm opacity-70"
      role="status"
    >
      <LoaderCircle class="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
      {{ loadingLabel }}
    </div>
    <div
      v-if="props.release"
      class="mb-8 rounded-xl border border-base-content/5 bg-base-200 overflow-hidden"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-base-content/5 bg-base-300/40"
      >
        <div class="flex items-center gap-2.5 flex-wrap min-w-0">
          <Tag class="w-4 h-4 text-primary shrink-0" />
          <span class="badge badge-primary badge-soft font-mono">v{{ props.release.version }}</span>
          <span
            v-if="props.release.title"
            class="text-sm font-medium truncate max-w-[min(100%,20rem)]"
          >
            {{ props.release.title }}
          </span>
          <span v-if="props.release.releasedAt" class="text-sm opacity-50">
            {{ new Date(props.release.releasedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US") }}
          </span>
        </div>
        <ReleaseSelector
          :releases="props.releases"
          :selected-version="props.release.version"
          :label="t('releases.version')"
          @select="emit('selectRelease', $event)"
        />
      </div>
      <div
        v-if="props.release.artifactsExpired"
        class="px-5 py-3 border-b border-warning/20 bg-warning/5 text-sm text-warning-content opacity-80"
      >
        {{ t("releases.expiredDetails") }}
      </div>

      <div v-if="releaseBodyHtml" class="relative">
        <div
          class="prose prose-sm max-w-none px-5 py-4 release-notes"
          :class="releaseExpanded ? 'max-h-none' : 'max-h-56 overflow-hidden'"
          v-html="releaseBodyHtml"
        />
        <div
          v-if="!releaseExpanded"
          class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-base-200 to-transparent"
        />
        <div class="flex justify-center px-5 pb-4">
          <button
            type="button"
            class="btn btn-ghost btn-xs gap-1 relative z-10"
            @click="releaseExpanded = !releaseExpanded"
          >
            <ChevronDown v-if="!releaseExpanded" class="w-3.5 h-3.5" />
            <ChevronUp v-else class="w-3.5 h-3.5" />
            {{ releaseExpanded ? t(props.releaseCollapseKey) : t(props.releaseExpandKey) }}
          </button>
        </div>
      </div>
      <div
        v-else
        class="px-5 py-4 text-sm opacity-60"
      >
        {{ t("releases.noNotes") }}
      </div>
    </div>

    <div class="rounded-xl border border-base-content/5 bg-base-200 overflow-hidden">
      <div class="grid md:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          class="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-base-content/5"
          role="tablist"
          :aria-label="t(props.badgeKey)"
        >
          <button
            v-for="platform in props.platforms"
            :key="platform.id"
            type="button"
            role="tab"
            :aria-selected="activePlatform === platform.id"
            class="btn btn-sm md:btn-md justify-start gap-2.5 shrink-0 md:w-full border-0"
            :class="
              activePlatform === platform.id
                ? 'btn-primary'
                : 'btn-ghost opacity-70 hover:opacity-100'
            "
            @click="activePlatform = platform.id"
          >
            <component
              :is="platform.icon"
              class="w-4 h-4 md:w-5 md:h-5 shrink-0"
              :class="platform.iconClass"
            />
            <span class="hidden sm:inline">{{ platform.label }}</span>
          </button>
        </nav>

        <div
          v-if="currentPlatform"
          class="p-5 sm:p-6 md:p-8 min-h-[280px]"
          role="tabpanel"
        >
          <div class="flex items-start gap-3 mb-2">
            <div class="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <component
                :is="currentPlatform.icon"
                class="w-6 h-6 text-primary"
                :class="
                  currentPlatform.iconClass
                    ? `${currentPlatform.iconClass} fill-primary`
                    : undefined
                "
              />
            </div>
            <div class="min-w-0">
              <h3 class="text-xl md:text-2xl font-bold">{{ t(currentPlatform.titleKey) }}</h3>
              <p class="text-sm opacity-65 mt-1 leading-relaxed">
                {{ t(currentPlatform.descKey) }}
              </p>
            </div>
          </div>

          <div v-if="currentPlatform.brew && props.brewCommand" class="mt-6 mb-5">
            <p class="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Homebrew</p>
            <div
              class="rounded-lg border border-base-content/10 bg-base-100 px-3 py-2.5 flex items-center gap-2"
            >
              <code class="flex-1 text-xs sm:text-sm font-mono break-all">{{ props.brewCommand }}</code>
              <button
                type="button"
                class="btn btn-ghost btn-sm btn-square shrink-0"
                :aria-label="copied ? 'Copied' : 'Copy command'"
                @click="copyCommand"
              >
                <Check v-if="copied" class="w-4 h-4 text-success" />
                <Copy v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <template
              v-for="action in currentPlatform.actions"
              :key="`${action.artifactPlatform || action.href}-${action.label}`"
            >
              <a
                v-if="actionHref(action)"
                :href="actionHref(action)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors"
                :class="actionRowClass[action.variant]"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-medium">
                      {{ action.i18n ? t(action.label) : action.label }}
                    </span>
                    <span
                      v-if="actionArtifact(action)?.size != null"
                      class="badge badge-ghost badge-sm font-mono"
                    >
                      {{ t("releases.artifact.bundleSize") }} ·
                      {{ formatArtifactSize(actionArtifact(action)?.size) }}
                    </span>
                  </div>
                  <div
                    v-if="actionArtifact(action)?.file_name"
                    class="mt-1 text-xs font-mono opacity-60 break-all"
                  >
                    {{ actionArtifact(action)?.file_name }}
                  </div>
                  <div
                    v-if="artifactUploadDate(actionArtifact(action))"
                    class="mt-1 text-xs opacity-50"
                  >
                    {{ t("releases.artifact.uploadedOn") }}
                    {{ artifactUploadDate(actionArtifact(action)) }}
                  </div>
                  <div
                    v-if="actionArtifact(action)?.hash"
                    class="mt-2 rounded-md border border-base-content/10 bg-base-100/70 px-2 py-1.5"
                  >
                    <span class="block text-[10px] uppercase tracking-wide opacity-50">
                      {{ t("releases.artifact.checksum") }}
                    </span>
                    <code
                      class="block mt-0.5 font-mono text-xs break-all opacity-80"
                      :title="actionArtifact(action)?.hash"
                    >
                      {{ actionArtifact(action)?.hash }}
                    </code>
                  </div>
                </div>
                <Download class="w-4 h-4 shrink-0 opacity-60 mt-0.5" />
              </a>
            </template>
            <div
              v-if="!hasAvailableAction"
              class="rounded-lg border border-dashed border-base-content/10 bg-base-100/50 px-4 py-3 text-sm opacity-60"
            >
              {{ t("releases.noDownloads") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-6">
      <a
        :href="props.githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-ghost btn-sm gap-2"
      >
        <CodeXml class="w-4 h-4" />
        {{ t(props.viewGithubKey) }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.release-notes :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.release-notes :deep(ul),
.release-notes :deep(ol) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.release-notes :deep(pre),
.release-notes :deep(code) {
  font-size: 0.85em;
}

.release-notes :deep(h1),
.release-notes :deep(h2),
.release-notes :deep(h3) {
  margin-top: 0.75em;
  margin-bottom: 0.35em;
}
</style>
