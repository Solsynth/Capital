<script lang="ts" setup>
import { NResult } from "naive-ui";

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection("terms").path(route.path).first();
});

useHead({
  title: () => page.value?.title || "Terms",
});
</script>

<template>
  <article
    v-if="page"
    class="prose lg:prose-lg dark:prose-invert prose-neutral mx-auto my-16 px-8"
  >
    <content-renderer :value="page" />
    <div v-if="page.updatedDate" class="text-sm mt-6">
      Last updated: {{ new Date(page.updatedDate).toLocaleDateString() }}
    </div>
  </article>
  <div v-else class="h-full flex items-center justify-center">
    <n-result
      status="404"
      title="Page not found"
      description="The page you are looking for does not exist."
    />
  </div>
</template>
