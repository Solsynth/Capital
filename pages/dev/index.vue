<template>
  <v-container fluid class="h-[calc(100vh-80px)] flex flex-col justify-center items-center text-center">
    <v-icon icon="mdi-code-tags" size="64" />
    <div class="text-2xl">Hello, developer!</div>
    <div class="max-w-[320px]">Switch page using navigator above to get start developing with Solar Network.</div>

    <div class="text-xs font-mono text-grey mt-5">
      @{{ auth.userinfo?.name }} · {{ auth.userinfo?.id.toString().padStart(8, '0') }}
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dev-portal",
})

useHead({
  title: "Landing",
})

const auth = useUserinfo()
</script>
