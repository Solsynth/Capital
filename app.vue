<template>
  <v-app>
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

onMounted(() => {
  theme.global.name.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
    theme.global.name.value = event.matches ? "dark" : "light"
  })

  if (checkLoggedIn()) {
    auth.readProfiles()
  }
})
</script>
