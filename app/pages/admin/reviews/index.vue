<script setup lang="ts">
import { Eye, EyeOff, Flag, Trash2, CheckCircle, XCircle, Clock } from "@lucide/vue"

definePageMeta({
  layout: "admin",
})

const { t } = useI18n()

const statusFilter = ref<"all" | "published" | "flagged" | "hidden">("all")

const { data: reviews, refresh } = await useAsyncData("admin-reviews", async () => {
  // For now this fetches from API — in production this would be a proper admin endpoint
  return []
})

async function updateStatus(id: string, status: string) {
  // Admin review moderation
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ t("admin.products.reviews") }}</h1>
        <p class="text-sm opacity-60 mt-1">Moderate product reviews and ratings</p>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="tabs tabs-boxed mb-6">
      <button
        class="tab"
        :class="statusFilter === 'all' ? 'tab-active' : ''"
        @click="statusFilter = 'all'"
      >
        All
      </button>
      <button
        class="tab"
        :class="statusFilter === 'published' ? 'tab-active' : ''"
        @click="statusFilter = 'published'"
      >
        Published
      </button>
      <button
        class="tab"
        :class="statusFilter === 'flagged' ? 'tab-active' : ''"
        @click="statusFilter = 'flagged'"
      >
        Flagged
      </button>
      <button
        class="tab"
        :class="statusFilter === 'hidden' ? 'tab-active' : ''"
        @click="statusFilter = 'hidden'"
      >
        Hidden
      </button>
    </div>

    <div class="text-center py-12">
      <p class="opacity-60">Review moderation coming soon.</p>
      <p class="text-sm opacity-40 mt-2">Admins will be able to hide, flag, and delete reviews from here.</p>
    </div>
  </div>
</template>
