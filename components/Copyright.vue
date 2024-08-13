<template>
  <div class="text-xs text-grey" :class="props.noCentered ? 'text-left' : 'text-center'">
    <p>{{ t("copyright") }} © {{ new Date().getFullYear() }} {{ t("brandNameFormal") }}</p>
    <p>Powered by <a class="underline" :href="projects[props.service][1]">{{ projects[props.service][0] }}</a></p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ service: string, noCentered?: boolean }>()

const { t } = useI18n()

const projects: { [id: string]: [string, string] } = {
  "passport": ["Hydrogen.Passport", "https://git.solsynth.dev/Hydrogen/Passport"],
  "paperclip": ["Hydrogen.Paperclip", "https://git.solsynth.dev/Hydrogen/Paperclip"],
}
</script>
