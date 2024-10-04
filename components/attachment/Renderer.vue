<template>
  <v-sheet v-if="item.is_mature && !showMature" color="rgba(0, 0, 0, .4)" height="calc(100% + 24px)" class="p-5">
    <v-row class="fill-height" align="center" justify="center">
      <v-col class="text-center">
        <h1 class="text-xl font-bold text-white">Mature Content</h1>
        <p class="text-md text-white">This content is rated and may not suitable for everyone to view.</p>

        <div class="flex justify-center mt-3">
          <v-btn
            variant="text"
            color="white"
            prepend-icon="mdi-eye"
            text="Reveal"
            @click="showMature = true"
          />
        </div>
      </v-col>
    </v-row>
  </v-sheet>
  <v-img v-else-if="item.mimetype.split('/')[0] == 'image'" :src="getAttachmentUrl(item.rid)" :alt="item.alt"
         class="w-full h-full" :cover="!props.noCover" />
  <video v-else-if="item.mimetype.split('/')[0] == 'video'" :src="getAttachmentUrl(item.rid)" class="w-full h-full"
         controls @click.stop />
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
            :href="getAttachmentUrl(item.rid)"
            target="_blank"
          />
        </div>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const props = defineProps<{ item: any, noCover?: boolean }>()

const item = computed(() => props.item)

const showMature = ref(false)

function getAttachmentUrl(id: string) {
  return `${config.public.solarNetworkApi}/cgi/uc/attachments/${id}`
}
</script>
