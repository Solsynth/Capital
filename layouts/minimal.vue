<template>
  <v-system-bar flat color="primary" class="px-5 flex justify-center">
    <v-btn icon="mdi-arrow-left" variant="text" color="white" size="x-small" class="mt-[2px]" @click="goBack" />
    <h2 class="mt-1">Solsynth LLC</h2>

    <v-spacer />
  </v-system-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
const router = useRouter()

function goBack() {
  if (window.history.length > 0) {
    router.go(-1)
  } else {
    navigateTo("/")
  }
}
</script>
