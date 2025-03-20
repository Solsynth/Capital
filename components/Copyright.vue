<template>
  <div class="text-xs text-grey" :class="props.noCentered ? 'text-left' : 'text-center'">
    <p>{{ t("copyright") }} © {{ new Date().getFullYear() }} {{ t("brandNameFormal") }}</p>
    <p v-if="services" class="flex" :class="props.noCentered ? 'justify-start' : 'justify-center'">
      <span>Powered by</span>
      <span class="flex services-list ms-1">
        <a class="service underline" v-for="item in services" :href="projects[item][1]">
          {{ projects[item][0] }}
        </a>
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ service?: string | string[], noCentered?: boolean }>()

const services = computed<string[]>(() => props.service instanceof Array ? (props.service ?? []) : (props.service ? [props.service] : []))

const { t } = useI18n()

const projects: { [id: string]: [string, string] } = {
  "solar-network": ["Solar Network", "https://solsynth.dev/products/solar-network"],
  "capital": ["Capital", "https://git.solsynth.dev/Goatworks/Capital"],
  "passport": ["HyperNet.Passport", "https://git.solsynth.dev/HyperNet/Passport"],
  "paperclip": ["HyperNet.Paperclip", "https://git.solsynth.dev/HyperNet/Paperclip"],
  "roadsign": ["RoadSign", "https://git.solsynth.dev/Goatworks/RoadSign"],
}
</script>

<style scoped>
.services-list .service:nth-child(n+2)::before {
  content: ", ";
}
</style>
