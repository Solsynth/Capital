<template>
  <v-app>
    <nuxt-loading-indicator color="white" />
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify"
import "@unocss/reset/tailwind.css"

const theme = useTheme()
const auth = useUserinfo()

const { locale } = useI18n()

watch(locale, (value) => {
  useHead({
    htmlAttrs: {
      lang: value,
    },
  })
}, { deep: true, immediate: true })

onMounted(() => {
  theme.global.name.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
    theme.global.name.value = event.matches ? "dark" : "light"
  })

  auth.readProfiles()
})
</script>
