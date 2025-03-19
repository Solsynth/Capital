<template>
  <div class="my-2">
    <post-item v-if="status === 'success'" class="no-margin-post" :post="post" :force-show-content="props.forceShowContent" />
    <div v-else>{{ t("loading") }}</div>
  </div>
</template>

<script setup lang="ts">
import PostItem from "~/components/PostItem.vue"

const props = defineProps<{ id: number, forceShowContent?: boolean }>()

const { t } = useI18n()

const config = useRuntimeConfig()

const { status, data: post } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/co/posts/${props.id}`)
</script>

<style scoped>
.no-margin-post {
  margin: 0 !important;
}
</style>
