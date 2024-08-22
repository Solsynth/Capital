<template>
  <v-card :title="t('download')" :subtitle="t('downloadDescription')" density="comfortable">
    <v-list>
      <v-list-item
        v-for="item in props.items"
        :prepend-icon="item.icon"
        :title="item.title"
        :subtitle="item.desc"
        :href="item.url"
        target="_blank"
      />
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ items: [{ title: string, icon: string, desc: string, url: string }] }>()

const { t } = useI18n()
</script>
