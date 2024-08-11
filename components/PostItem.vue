<template>
  <v-card :to="`/posts/${props.post.id}`" class="mx-[2.5ch] mb-3">
    <v-card-text>
      <div class="mb-3 flex flex-row gap-4">
        <v-avatar :image="post.author?.avatar" />
        <div class="flex flex-col">
          <span>{{ post.author?.nick }} <span class="text-xs">@{{ post.author?.name }}</span></span>
          <span v-if="post.body?.title" class="text-md">{{ post.body?.title }}</span>
          <span v-if="post.body?.description" class="text-sm">{{ post.body?.description }}</span>
          <span v-if="!post.body?.title && !post.body?.description" class="text-sm">{{ post.author?.description
            }}</span>
        </div>
      </div>

      <div v-if="post.body?.thumbnail" class="mb-5">
        <v-img
          :src="`${config.public.solarNetworkApi}/cgi/files/attachments/${post.body?.thumbnail}`"
          :aspect-ratio="16 / 9"
          class="rounded-md"
          cover
        />
      </div>

      <article v-if="post.type == 'story'" class="text-base prose mx-auto">
        <m-d-c :value="post.body?.content"></m-d-c>
      </article>

      <v-card v-if="post.body?.attachments?.length > 0" class="mb-5">
        <attachment-carousel :attachments="post.body?.attachments" />
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

      <div v-if="post.tags?.length > 0" class="text-xs text-grey flex flex-row gap-1">
        <span v-for="tag in post.tags">#{{ tag.alias }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ post: any }>()
const config = useRuntimeConfig()
</script>
