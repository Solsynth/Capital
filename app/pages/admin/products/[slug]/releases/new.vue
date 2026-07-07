<script setup lang="ts">
import { ArrowLeft, Send, Plus, Trash2 } from "@lucide/vue"
import { ref } from "vue"

definePageMeta({
  layout: "admin",
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)

const { data: product } = await useAsyncData(`admin-product-new-${slug.value}`, async () => {
  const p = await queryCollection("products")
    .where("path", "LIKE", `%/products/%/${slug.value}`)
    .first()
  return p
})

interface Artifact {
  id: string
  name: string
  platform: string
  url: string
  fileSize: string
}

const artifacts = ref<Artifact[]>([])

function addArtifact() {
  artifacts.value.push({
    id: crypto.randomUUID(),
    name: "",
    platform: "",
    url: "",
    fileSize: "",
  })
}

function removeArtifact(id: string) {
  artifacts.value = artifacts.value.filter((a) => a.id !== id)
}

const form = ref({
  version: "",
  title: "",
  changelog: "",
  isPrerelease: false,
  syncToGithub: true,
  releasedAt: new Date().toISOString().split("T")[0],
})

const submitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!form.value.version || !form.value.releasedAt) {
    error.value = "Version and release date are required"
    return
  }

  const validArtifacts = artifacts.value.filter((a) => a.platform && a.url)

  submitting.value = true
  error.value = null

  try {
    await $fetch(`/api/products/${slug.value}/releases`, {
      method: "POST",
      body: {
        version: form.value.version,
        title: form.value.title || undefined,
        changelog: form.value.changelog,
        isPrerelease: form.value.isPrerelease,
        syncToGithub: form.value.syncToGithub,
        releasedAt: new Date(form.value.releasedAt).toISOString(),
        githubRepo: product.value?.githubRepo || product.value?.repo,
        artifacts: validArtifacts.map((a) => ({
          name: a.name || undefined,
          platform: a.platform,
          url: a.url,
          fileSize: a.fileSize || undefined,
        })),
      },
    })

    router.push(`/admin/products/${slug.value}/releases`)
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Failed to create release"
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl">
    <div class="mb-6">
      <button
        class="btn btn-ghost btn-sm gap-1 mb-4"
        @click="router.back()"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <h1 class="text-2xl font-bold">{{ t("admin.products.addRelease") }}</h1>
      <p class="text-sm opacity-60">{{ product?.title || slug }}</p>
    </div>

    <div v-if="error" class="alert alert-error alert-sm mb-4">
      <span>{{ error }}</span>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Version <span class="text-error">*</span></legend>
        <input
          v-model="form.version"
          type="text"
          placeholder="1.0.0"
          class="input input-bordered"
          required
        />
        <p class="label">e.g. 1.2.0</p>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Title</legend>
        <input
          v-model="form.title"
          type="text"
          placeholder="Release title (optional)"
          class="input input-bordered"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Release Date <span class="text-error">*</span></legend>
        <input
          v-model="form.releasedAt"
          type="date"
          class="input input-bordered"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Changelog</legend>
        <textarea
          v-model="form.changelog"
          placeholder="## What's Changed&#10;&#10;- Feature A&#10;- Bug fix B&#10;&#10;**Full Changelog**: v1.1.0...v1.2.0"
          class="textarea textarea-bordered h-40"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Artifacts</legend>
        <button
          type="button"
          class="btn btn-ghost btn-xs gap-1 mb-2 self-start"
          @click="addArtifact"
        >
          <Plus class="w-3 h-3" />
          Add Artifact
        </button>

        <div v-if="artifacts.length > 0" class="overflow-x-auto">
          <table class="table table-sm table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Platform</th>
                <th>Download URL</th>
                <th>File Size</th>
                <th class="w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="artifact in artifacts" :key="artifact.id">
                <td>
                  <input
                    v-model="artifact.name"
                    type="text"
                    placeholder="e.g. Installer, DMG"
                    class="input input-bordered input-sm w-full min-w-32"
                  />
                </td>
                <td>
                  <input
                    v-model="artifact.platform"
                    type="text"
                    placeholder="e.g. macOS, Windows"
                    class="input input-bordered input-sm w-full min-w-28"
                    required
                  />
                </td>
                <td>
                  <input
                    v-model="artifact.url"
                    type="url"
                    placeholder="https://..."
                    class="input input-bordered input-sm w-full min-w-48"
                    required
                  />
                </td>
                <td>
                  <input
                    v-model="artifact.fileSize"
                    type="text"
                    placeholder="e.g. 12.5 MB"
                    class="input input-bordered input-sm w-24"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-error"
                    @click="removeArtifact(artifact.id)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="label">
          No artifacts defined. Click "Add Artifact" to add platform-specific download links.
        </p>

        <p class="label">
          Platform values are dynamic — use any identifier (e.g. macOS, Windows, Linux, iOS, Android).
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Options</legend>
        <div class="flex items-center gap-6">
          <label class="label cursor-pointer gap-2">
            <input
              v-model="form.isPrerelease"
              type="checkbox"
              class="checkbox checkbox-sm checkbox-warning"
            />
            <span class="label-text">Pre-release</span>
          </label>

          <label
            v-if="product?.githubRepo || product?.repo"
            class="label cursor-pointer gap-2"
          >
            <input
              v-model="form.syncToGithub"
              type="checkbox"
              class="checkbox checkbox-sm checkbox-primary"
            />
            <span class="label-text">{{ t("admin.products.syncToGithub") }}</span>
          </label>
        </div>
      </fieldset>

      <div class="flex gap-2 pt-4">
        <button
          type="button"
          class="btn btn-ghost"
          @click="router.back()"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary gap-2"
          :disabled="submitting"
        >
          <Send class="w-4 h-4" />
          {{ submitting ? "Creating..." : "Create Release" }}
        </button>
      </div>
    </form>
  </div>
</template>
