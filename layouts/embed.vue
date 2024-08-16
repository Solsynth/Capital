<template>
  <v-system-bar color="primary">
    <span>© {{ new Date().getFullYear() }} {{ t("brandName") }}</span>
    <v-spacer />
    <span>{{ t("embedWidget") }}</span>
  </v-system-bar>

  <v-container fluid class="mx-auto justify-center px-8">
    <v-main>
      <slot />
    </v-main>

    <div class="text-center flex flex-col justify-center gap-1.5 text-grey text-xs">
      <copyright :service="['capital', 'solar-network']" />
      <div class="flex gap-2 justify-center">
        <v-menu location="top center">
          <template v-slot:activator="{ props }">
            <span v-bind="props">{{ t("language") }}</span>
          </template>
          <v-list class="w-fit">
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
        <v-divider vertical />
        <nuxt-link target="_blank" :to="route.fullPath.replace('/embed', '')">
          {{ t("openInSite") }}
        </nuxt-link>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const { locale, locales, setLocale, t } = useI18n()
</script>
