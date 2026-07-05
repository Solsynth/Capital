<script setup lang="ts">
import { ArrowLeft, Save } from "@lucide/vue"
import { ref } from "vue"

definePageMeta({
  layout: "admin",
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)
const version = computed(() => route.params.version as string)

const { data: release, refresh } = await useAsyncData(`admin-release-edit-${slug.value}-${version.value}`, async () => {
  const p = await queryCollection("products")
    .where("path", "LIKE", `%/products/%/${slug.value}`)
    .first()
  const r = await $fetch(`/api/products/${slug.value}/releases/${version.value}`)
  return { product: p, release: r.release }
})

const form = ref({
  title: release.value?.release?.title || "",
  changelog: release.value?.release?.changelog || "",
  downloadUrl: release.value?.release?.downloadUrl || "",
  isPrerelease: release.value?.release?.isPrerelease || false,
  releasedAt: release.value?.release?.releasedAt
    ? new Date(release.value.release.releasedAt).toISOString().split("T")[0]
    : "",
})

const submitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!form.value.releasedAt) {
    error.value = "Release date is required"
    return
  }

  submitting.value = true
  error.value = null

  try {
    await $fetch(`/api/products/${slug.value}/releases/${version.value}`, {
      method: "PUT",
      body: {
        title: form.value.title || null,
        changelog: form.value.changelog,
        downloadUrl: form.value.downloadUrl || null,
        isPrerelease: form.value.isPrerelease,
        releasedAt: new Date(form.value.releasedAt).toISOString(),
      },
    })

    router.push(`/admin/products/${slug.value}/releases`)
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Failed to update release"
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!confirm("Are you sure you want to delete this release?")) return

  try {
    await $fetch(`/api/products/${slug.value}/releases/${version.value}`, {
      method: "DELETE",
    })
    router.push(`/admin/products/${slug.value}/releases`)
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Failed to delete release"
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <button
        class="btn btn-ghost btn-sm gap-1 mb-4"
        @click="router.back()"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <h1 class="text-2xl font-bold">Edit Release v{{ version }}</h1>
      <p class="text-sm opacity-60">{{ release?.product?.title || slug }}</p>
    </div>

    <div v-if="error" class="alert alert-error alert-sm mb-4">
      <span>{{ error }}</span>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Title</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Release title"
          class="input input-bordered"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Release Date <span class="text-error">*</span></span>
        </label>
        <input
          v-model="form.releasedAt"
          type="date"
          class="input input-bordered"
          required
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Changelog</span>
        </label>
        <textarea
          v-model="form.changelog"
          placeholder="Changelog content (Markdown supported)"
          class="textarea textarea-bordered h-40"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Download URL</span>
        </label>
        <input
          v-model="form.downloadUrl"
          type="url"
          placeholder="https://..."
          class="input input-bordered"
        />
      </div>

      <label class="label cursor-pointer gap-2">
        <input
          v-model="form.isPrerelease"
          type="checkbox"
          class="checkbox checkbox-sm checkbox-warning"
        />
        <span class="label-text">Pre-release</span>
      </label>

      <div class="flex gap-2 pt-4">
        <button
          type="button"
          class="btn btn-ghost text-error"
          @click="handleDelete"
        >
          Delete
        </button>
        <div class="flex-1" />
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
          <Save class="w-4 h-4" />
          {{ submitting ? "Saving..." : "Save Changes" }}
        </button>
      </div>
    </form>
  </div>
</template>
