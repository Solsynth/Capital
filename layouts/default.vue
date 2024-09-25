<template>
  <v-app-bar flat color="primary">
    <v-container fluid class="mx-auto d-flex align-center justify-center px-8">
      <v-tooltip>
        <template #activator="{ props }">
          <div @click="openDrawer = !openDrawer" v-bind="props" class="cursor-pointer">
            <v-img class="me-4 ms-1" width="32" height="32" alt="Logo" :src="Logo" />
          </div>
        </template>
        Open / close drawer
      </v-tooltip>


      <nuxt-link to="/" exact>
        <h2 class="mt-1">Solsynth LLC</h2>
      </nuxt-link>

      <v-spacer></v-spacer>

      <locale-select />
      <user-menu />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" floating>
    <v-list density="compact" nav color="primary">
      <v-list-item :title="t('navProducts')" prepend-icon="mdi-shape" to="/products" exact />
      <v-list-item :title="t('navPosts')" prepend-icon="mdi-note-text" to="/posts" exact />
      <v-list-item :title="t('navActivity')" prepend-icon="mdi-newspaper-variant-multiple-outline" to="/activity" exact />
      <v-list-item :title="t('navGallery')" prepend-icon="mdi-image-multiple" to="/gallery" exact />
    </v-list>

    <v-divider class="border-opacity-50 my-1" />

    <v-list density="compact" nav color="primary">
      <v-list-item title="Developer Portal" prepend-icon="mdi-code-tags" to="/dev" exact />
      <v-list-item title="Creator Hub" prepend-icon="mdi-pencil" to="/creator" exact />
    </v-list>

    <v-divider class="border-opacity-50 mb-4 mt-0.5" />

    <copyright no-centered service="capital" class="px-5" />

    <footer-links class="px-5 mt-3" />
  </v-navigation-drawer>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import Logo from "../assets/logo-w-shadow.png"

const {  t } = useI18n()

const openDrawer = ref(false)
</script>
