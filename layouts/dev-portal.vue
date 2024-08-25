<template>
  <v-app-bar flat color="primary" scroll-behavior="hide" scroll-threshold="800">
    <v-container fluid class="mx-auto d-flex align-center justify-center px-8">
      <nuxt-link to="/dev" exact class="flex items-center me-4">
        <v-img class="me-3 ms-1" width="32" height="32" alt="Logo" :src="Logo" />

        <span>Developer Portal</span>
      </nuxt-link>

      <div class="nav-links overflow-y-auto flex">
        <v-btn variant="text" text="Bots" to="/dev/bots" exact />
      </div>

      <v-spacer></v-spacer>

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

      <user-menu />
    </v-container>
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import Logo from "../assets/logo-w-shadow.png"

const { locale, locales, setLocale, t } = useI18n()

useHead({
  titleTemplate: "%s | Solsynth Dev Portal"
})
</script>

<style scoped>
.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
