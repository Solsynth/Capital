<template>
  <div>
    <div class="my-3 flex flex-row gap-4">
      <v-avatar :image="post.author?.avatar" />
      <div class="flex flex-col">
        <span>{{ post.author?.nick }} <span class="text-xs">@{{ post.author?.name }}</span></span>
        <span v-if="post.body?.title" class="text-md">{{ post.body?.title }}</span>
        <span v-if="post.body?.description" class="text-sm">{{ post.body?.description }}</span>
        <span v-if="!post.body?.title && !post.body?.description" class="text-sm">{{ post.author?.description }}</span>
      </div>
    </div>

    <v-card v-if="post.body?.thumbnail" class="mb-5">
      <v-img
        :src="`${config.public.solarNetworkApi}/cgi/uc/attachments/${post.body?.thumbnail}`"
        :aspect-ratio="16 / 9"
        cover
      />
    </v-card>

    <article class="text-base prose xl:text-lg mx-auto max-w-none">
      <m-d-c :value="post.body?.content"></m-d-c>
    </article>

    <v-card v-if="post.body?.attachments?.length > 0" class="mb-5">
      <attachment-carousel :attachments="post.body?.attachments" @update:metadata="args => attachments = args" />
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

    <div
      v-if="post.tags?.length > 0"
      class="text-xs text-grey flex flex-row gap-1 mb-3"
    >
      <nuxt-link
        v-for="tag in post.tags"
        :to="`/posts/tags/${tag.alias}`"
        class="hover:underline hover:underline-dotted"
        @click.stop
      >
        #{{ tag.alias }}
      </nuxt-link>
    </div>

    <div class="text-xs text-grey flex flex-col mb-5">
      <span>Solar Network Post Web Preview</span>
      <span>To get full view of this post, open it on <a class="underline" :href="externalOpenLink">Solian</a></span>
    </div>

    <div v-if="post.metric.reply_count" class="mb-5">
      <v-card variant="outlined" :title="t('postReplies')" :subtitle="t('postRepliesCaption')">
        <post-reply-list class="mt-[-20px] mx-[-1ch] mb-3" :post-id="post.id" />
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "embed",
  alias: ["/embed/posts/:area/:id"],
})

const route = useRoute()
const config = useRuntimeConfig()

const attachments = ref<any[]>([])
const firstImage = ref<string | null>()
const firstVideo = ref<string | null>()

const slug = computed(() => {
  if (route.params.area) {
    return `${route.params.area}:${route.params.id}`
  } else {
    return route.params.id
  }
})

const { t } = useI18n()

const { data: post } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/co/posts/${slug.value}`)

if (!post.value) {
  const { data: publisher } = await $fetch<any>(`${config.public.solarNetworkApi}/cgi/co/publishers/${route.params.id}`)
  if (publisher) {
    navigateTo(`/posts/publishers/${route.params.id}`)
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Post Not Found",
  })
} else if (post.value.alias && !route.params.area) {
  navigateTo(`/posts/${post.value.area_alias}/${post.value.alias}`)
}

const title = computed(() => post.value.body?.title ? `${post.value.body?.title} from ${post.value.author.nick}` : `Post from ${post.value.author.nick}`)
const description = computed(() => post.value.body?.description ?? post.value.body?.content.substring(0, 160).trim())

watch(attachments, (value) => {
  if (post.value.body?.thumbnail) {
    firstImage.value = `${config.public.solarNetworkApi}/cgi/uc/attachments/${post.value.body?.thumbnail}`
  }
  if (value.length > 0 && value[0].mimetype.split("/")[0] == "image") {
    firstImage.value = `${config.public.solarNetworkApi}/cgi/uc/attachments/${attachments.value[0].id}`
  }

  if (value.length > 0 && value[0].mimetype.split("/")[0] == "video") {
    firstVideo.value = `${config.public.solarNetworkApi}/cgi/uc/attachments/${attachments.value[0].id}`
  }
}, { immediate: true, deep: true })

useHead({
  title: title.value,
  titleTemplate: "%s on Solar Network",
  link: [
    { rel: "icon", type: "image/png", href: "/icon-solar-network.png" },
    { rel: "apple-touch-icon", type: "image/png", href: "/icon-solar-network.png" },
  ],
})

useSeoMeta({
  author: post.value.author.nick,
  title: title,
  articlePublishedTime: post.value.publishedAt,
  description: description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${route.fullPath}`,
  ogImage: firstImage,
  ogVideo: firstVideo,
  ogType: "article",
  publisher: "Solar Network",
  ogSiteName: "Solsynth Capital",
  generator: "Solar Network Open Project · Embed Widget",
})

const externalOpenLink = computed(() => `${config.public.solianUrl}/posts/view/${slug.value}`)
</script>
