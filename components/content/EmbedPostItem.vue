<template>
  <div class="my-2">
    <div v-if="status == 'pending'">{{ t("loading") }}</div>
    <post-item v-else class="no-margin-post" :post="post" :force-show-content="props.forceShowContent" />
  </div>
</template>

<script setup lang="ts">
import PostItem from "~/components/PostItem.vue"

const props = defineProps<{ id: number, forceShowContent?: boolean }>()

const { t } = useI18n()

const config = useRuntimeConfig()

const { status, data: post } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/interactive/posts/${props.id}`)
</script>

<style scoped>
.no-margin-post {
  margin: 0 !important;
}
</style>
