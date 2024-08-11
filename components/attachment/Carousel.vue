<template>
  <v-carousel
    hide-delimiter-background
    hide-delimiters
    :progress="attachments.length > 1"
    :show-arrows="attachments.length > 1 ? 'hover' : false"
    height="auto"
  >
    <v-carousel-item v-for="item in metadata" class="fill-height">
      <v-img v-if="item.mimetype.split('/')[0] == 'image'" :src="getAttachmentUrl(item.id)" class="fill-height" cover />
      <video v-else-if="item.mimetype.split('/')[0] == 'video'" :src="getAttachmentUrl(item.id)" class="fill-height"
             controls />
      <v-sheet v-else color="rgba(0, 0, 0, .4)" height="calc(100% + 24px)" class="p-5">
        <v-row class="fill-height" align="center" justify="center">
          <v-col class="text-center">
            <h1 class="text-xl font-bold text-white">
              {{ item.alt }}
            </h1>
            <p class="text-md text-white">{{ item.mimetype }}</p>

            <p class="text-sm text-white mt-3">Unable to preview, you can open it via other ways.</p>

            <div class="flex justify-center mt-3">
              <v-btn
                variant="text"
                color="white"
                prepend-icon="mdi-launch"
                text="Open in browser"
                :href="getAttachmentUrl(item.id)"
                target="_blank"
              />
            </div>
          </v-col>
        </v-row>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>

<script setup lang="ts">
const props = defineProps<{ attachments: number[] }>()
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
