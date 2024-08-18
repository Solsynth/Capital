<template>
  <v-card :to="url" class="mx-[2.5ch] mb-3">
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
          :src="`${config.public.solarNetworkApi}/cgi/uc/attachments/${post.body?.thumbnail}`"
          :aspect-ratio="16 / 9"
          alt="Post thumbnail"
          class="rounded-md"
          cover
        />
      </div>

      <article v-if="post.type == 'story' || props.forceShowContent" class="text-base prose max-w-none">
        <m-d-c :value="post.body?.content"></m-d-c>
      </article>

      <v-card v-if="post.body?.attachments?.length > 0" class="mb-5">
        <attachment-carousel
          :no-clickable-attachment="props.noClickableAttachment"
          :attachments="post.body?.attachments"
        />
      </v-card>

      <div class="text-sm flex flex-col">
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
        class="text-xs text-grey flex flex-row gap-1 mt-3"
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
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ post: any, forceShowContent?: boolean, noClickableAttachment?: boolean }>()
const config = useRuntimeConfig()

const url = computed(() => props.post.alias ? `/posts/${props.post.area_alias}/${props.post.alias}` : `/posts/${props.post.id}`)
</script>
