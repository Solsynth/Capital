<template>
  <v-app-bar app flat color="surface" class="app-bar-blur">
    <v-container fluid class="mx-auto d-flex align-center justify-center pr-8 relative">
      <v-app-bar-nav-icon @click="openDrawer = !openDrawer" class="z-10" />

      <nuxt-link to="/" exact class="z-10">
        <h2 v-if="isLargeScreen">Solsynth LLC</h2>
        <v-icon v-else icon="mdi-home" />
      </nuxt-link>

      <v-spacer></v-spacer>

      <div class="absolute left-0 right-0 flex justify-center gap-2 w-screen">
        <v-btn v-if="isLargeScreen" v-for="item in navItems" :to="item.to" exact :prepend-icon="item.icon">{{
          t(item.title)
        }}</v-btn>
        <v-menu location="bottom center" v-else>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-horizontal-circle" slim size="small" />
          </template>
          <v-list nav slim class="w-[280px]">
            <v-list-item v-for="item in navItems" :to="item.to" :prepend-icon="item.icon">
              <v-list-item-title>{{ t(item.title) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-spacer></v-spacer>

      <locale-select class="z-10" />
      <user-menu class="z-10" />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" temporary order="-1">
    <v-list density="compact" nav color="primary">
      <v-list-item title="Developer Portal" prepend-icon="mdi-code-tags" to="/dev" exact />
      <v-list-item title="Creator Hub" prepend-icon="mdi-pencil" to="/creator" exact />
    </v-list>

    <v-divider class="border-opacity-50 my-1" />

    <v-list density="compact" nav color="primary">
      <v-list-item title="Code Repository" prepend-icon="mdi-git" href="https://git.solsynth.dev" target="_blank" />
    </v-list>

    <v-divider class="border-opacity-50 mb-4 mt-0.5" />

    <copyright no-centered :service="['roadsign', 'capital']" class="px-5" />

    <footer-links class="px-5 mt-3" />
  </v-navigation-drawer>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsVuetifyV3 } from "@vueuse/core"

const { t } = useI18n()

const openDrawer = ref(false)

const breakpoints = useBreakpoints(breakpointsVuetifyV3)
const isLargeScreen = computed(() => breakpoints.isGreaterOrEqual("md").valueOf())

interface NavItem {
  icon: string
  title: string
  to: string
}

const navItems: NavItem[] = [
  {
    icon: "mdi-shape",
    title: "navProducts",
    to: "/products",
  },
  {
    icon: "mdi-note-text",
    title: "navPosts",
    to: "/posts",
  },
  {
    icon: "mdi-image-multiple",
    title: "navGallery",
    to: "/gallery",
  },
]
</script>

<style lang="css" scoped>
.app-bar-blur {
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0) 100%);
  mask-repeat: no-repeat;
  mask-size: 100%;
}
</style>
