<template>
  <v-infinite-scroll :items="posts" :onLoad="loadPost">
    <template v-for="item in posts" :key="item">
      <post-item :post="item" no-clickable-attachment />
    </template>
  </v-infinite-scroll>
</template>

<script setup lang="ts">
const props = defineProps<{ postId: number }>()

const config = useRuntimeConfig()

const posts = ref<any[]>([])

async function loadPost({ done }: any) {
  const searchQueries = new URLSearchParams({
    take: (10).toString(),
    offset: posts.value.length.toString(),
  })

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/co/posts/${props.postId}/replies?` + searchQueries)
  const result = await res.json()

  if (result.data.length > 0) {
    posts.value.push(...result.data)
    done("ok")
  } else {
    done("empty")
  }
}
</script>
