<template>
  <v-carousel
    hide-delimiter-background
    hide-delimiters
    :progress="attachments.length > 1 ? 'primary' : false"
    :show-arrows="attachments.length > 1 ? 'hover' : false"
    height="auto"
  >
    <v-carousel-item v-for="item in metadata" class="fill-height">
      <nuxt-link v-if="item.mimetype.split('/')[0] == 'image' && !props.noClickableAttachment"
                 :to="`/gallery/${item.id}`">
        <attachment-renderer :item="item" />
      </nuxt-link>
      <div v-else>
        <attachment-renderer :item="item" />
      </div>
    </v-carousel-item>
  </v-carousel>
</template>

<script setup lang="ts">
const props = defineProps<{ attachments: number[], noClickableAttachment?: boolean }>()
const emits = defineEmits(["update:metadata"])

const config = useRuntimeConfig()

const { data } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/files/attachments?take=${props.attachments.length}&id=${props.attachments.join(",")}`)
const metadata = computed(() => data.value.data)

watch(metadata, (value) => {
  emits("update:metadata", value)
}, { deep: true, immediate: true })

function getAttachmentUrl(id: number) {
  return `${config.public.solarNetworkApi}/cgi/files/attachments/${id}`
}
</script>
