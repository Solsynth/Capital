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

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" floating>
    <v-list density="compact" nav color="primary">
      <v-list-item :title="t('navProducts')" prepend-icon="mdi-shape" to="/products" exact />
      <v-list-item :title="t('navActivity')" prepend-icon="mdi-newspaper" to="/activity" exact />
      <v-list-item :title="t('navGallery')" prepend-icon="mdi-album" to="/gallery" exact />
    </v-list>

    <v-divider class="border-opacity-50 my-1" />

    <v-list density="compact" nav color="primary">
      <v-list-item title="Developer Portal" prepend-icon="mdi-code-tags" to="/dev" exact />
      <v-list-item title="Creator Hub" prepend-icon="mdi-pencil" to="#" exact />
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

const { locale, locales, setLocale, t } = useI18n()

const openDrawer = ref(false)
</script>
