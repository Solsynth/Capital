<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 flex flex-row gap-4">
      <v-avatar :image="post.author?.avatar" />
      <div class="flex flex-col">
        <span>{{ post.author?.nick }} <span class="text-xs">@{{ post.author?.name }}</span></span>
        <span v-if="post.body?.title" class="text-md">{{ post.body?.title }}</span>
        <span v-if="post.body?.description" class="text-sm">{{ post.body?.description }}</span>
        <span v-if="!post.body?.title && !post.body?.description" class="text-sm">{{ post.author?.description }}</span>
      </div>
    </div>

    <article class="text-base prose prose-truegray xl:text-lg mx-auto">
      <m-d-c :value="post.body?.content"></m-d-c>
    </article>

    <v-card v-if="post.body?.attachments?.length > 0" class="mb-5">
      <v-carousel hide-delimiter-background hide-delimiters progress show-arrows="hover">
        <v-carousel-item
          v-for="attachment in post.body?.attachments"
          :src="getAttachmentUrl(attachment)"
          :aspect-ratio="16 / 9"
          cover
        />
      </v-carousel>
    </v-card>

    <div class="mb-3 text-sm flex flex-col">
      <span class="flex flex-row gap-1">
      <span>
        {{ post.metric.reply_count }} {{ post.metric.reply_count > 1 ? "replies" : "reply" }},
      </span>
      <span>
        {{ post.metric.reaction_count }} {{ post.metric.reaction_count > 1 ? "reactions" : "reaction" }}
      </span>
      </span>
      <span>
        {{ post.type.startsWith("a") ? "An" : "A" }} {{ post.type }} posted on
        {{ new Date(post.published_at).toLocaleString() }}
      </span>
    </div>

    <div class="text-xs text-grey flex flex-col">
      <span>Solar Network Post Web Preview</span>
      <span>To get full view of this post, open it on <a class="underline" :href="externalOpenLink">Solian</a></span>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { createSEOHead } from "~/utils/seo"

const route = useRoute()
const config = useRuntimeConfig()

const { data: post } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/interactive/posts/${route.params.id}`)

useHead({
  title: post.value.body?.title ?? `Post #${route.params.id}`,
  meta: [
    ...createSEOHead(
      post.value.body?.title ?? `Post #${route.params.id}`,
      post.value.body?.description ?? post.value.body?.content.substring(0, 160).trim(),
      route.fullPath,
    ),
  ],
  titleTemplate: "%s on Solar Network",
  link: [{ rel: "icon", type: "image/png", href: "/favicon-solian.png" }],
})

const externalOpenLink = computed(() => `${config.public.solianUrl}/posts/view/${route.params.id}`)

function getAttachmentUrl(id: number) {
  return `${config.public.solarNetworkApi}/cgi/files/attachments/${id}`
}
</script>

<style scoped>
.content-container {
  max-width: 65ch !important;
}
</style>
