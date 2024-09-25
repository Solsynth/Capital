<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        size="small"
        icon="mdi-translate"
        v-bind="props"
      />
    </template>
    <v-list>
      <v-list-item
        class="w-48"
        density="compact"
        v-for="item in locales"
        :key="item.code"
        :value="item.code"
        :active="locale == item.code"
        @click.prevent.stop="setLocale(item.code)"
      >
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
const { locale, locales, setLocale } = useI18n()
</script>
