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


      <nuxt-link to="/docs" exact>
        <h2 class="mt-1">Solsynth Knowledge Base</h2>
      </nuxt-link>

      <v-spacer></v-spacer>

      <locale-select />
      <user-menu />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" floating>
    <v-list density="compact" nav color="primary">
      <v-list-item title="Back" prepend-icon="mdi-arrow-left" to="/" exact />
    </v-list>

    <v-divider class="border-opacity-50 my-1" />

    <content-navigation v-slot="{ navigation }" :query="navQuery" :key="route.path">
      <v-list density="compact" nav color="primary">
        <v-list-item
          v-if="navNotRoot"
          title="Previous"
          prepend-icon="mdi-page-previous"
          exact
          @click="previousNav"
        />

        <v-list-item
          v-if="navigation[0]?.children"
          v-for="link of fullyFlatMap(navigation[0])"
          :key="link._path"
          :title="link.title"
          :to="link._path"
          :prepend-icon="link.icon ?? 'mdi-text-box'"
          exact
        />

        <v-list-item v-else title="No Content" prepend-icon="mdi-close-box-outline" disabled />
      </v-list>
    </content-navigation>

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

const { locale } = useI18n()
const route = useRoute()

const navNotRoot = computed(() => route.path.split("/").length > 2)
const navQuery = computed(() => ({
  where: {
    _path: new RegExp("^\\" + route.path + ".*"),
    _locale: getLocale(locale),
  },
}))

function previousNav() {
  const arr = route.path.split("/")
  arr.pop()
  navigateTo(arr.join("/"))
}

function fullyFlatMap(input: any): any[] {
  const result: any[] = []
  const pathSet = new Set<string>()
  for (const item of input?.children ?? []) {
    result.push(item)
    result.push(...fullyFlatMap(item))
  }
  return result.filter((x) => {
    if (pathSet.has(x._path)) return false
    pathSet.add(x._path)
    return true
  })
}

const openDrawer = ref(false)
</script>
