<template>
  <div class="w-full max-w-[720px]">
    <v-expand-transition>
      <v-alert v-show="route.query['redirect_uri']" variant="tonal" type="info" class="text-xs">
        {{ t("callbackHint") }} <br />
        <span class="font-mono">{{ route.query["redirect_uri"] }}</span>
      </v-alert>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
</script>
