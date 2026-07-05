<script setup lang="ts">
import { ArrowLeft, Send } from "@lucide/vue"
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

const form = ref({
  version: "",
  title: "",
  changelog: "",
  downloadUrl: "",
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

  submitting.value = true
  error.value = null

  try {
    const body = await $fetch(`/api/products/${slug.value}/releases`, {
      method: "POST",
      body: {
        version: form.value.version,
        title: form.value.title || undefined,
        changelog: form.value.changelog,
        downloadUrl: form.value.downloadUrl || undefined,
        isPrerelease: form.value.isPrerelease,
        syncToGithub: form.value.syncToGithub,
        releasedAt: new Date(form.value.releasedAt).toISOString(),
        githubRepo: product.value?.githubRepo || product.value?.repo,
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
  <div class="max-w-2xl">
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
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Version <span class="text-error">*</span></span>
          <span class="label-text-alt">e.g. 1.2.0</span>
        </label>
        <input
          v-model="form.version"
          type="text"
          placeholder="1.0.0"
          class="input input-bordered"
          required
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Title</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Release title (optional)"
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
          placeholder="## What's Changed&#10;&#10;- Feature A&#10;- Bug fix B&#10;&#10;**Full Changelog**: v1.1.0...v1.2.0"
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
