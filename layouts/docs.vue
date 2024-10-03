<template>
  <v-app-bar flat color="primary">
    <v-container fluid class="mx-auto d-flex align-center justify-center pe-8">
      <v-app-bar-nav-icon class="me-1" @click="openDrawer = !openDrawer" />

      <nuxt-link to="/docs" exact>
        <h2 class="mt-0.5">Solsynth Knowledge Base</h2>
      </nuxt-link>

      <v-spacer></v-spacer>

      <locale-select @update="reload" />
      <user-menu />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" floating>
    <content-navigation v-slot="{ navigation }" :query="navQuery" :key="route.path">
      <v-list density="compact" nav color="primary" class="mt-1">
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

  <v-app-bar color="transparent" density="compact" class="backdrop-blur-md">
    <v-app-bar-nav-icon icon="mdi-home" to="/" class="ms-4" />
    <div class="flex items-center justify-center h-[60px]">
      <v-breadcrumbs :items="breadcrumb" density="compact" class="px-0 mt-0.5"></v-breadcrumbs>
    </div>
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()

const breadcrumb = computed(() => {
  const arr = route.path.replace(/^\/|\/$/g, "").split("/")
  arr.shift()
  return arr.map((x, idx) => ({
    title: x,
    to: `/docs/${arr.slice(0, idx + 1).join("/")}`,
  }))
})

const navNotRoot = computed(() => route.path.split("/").length > 2)
const navQuery = computed(() => ({
  where: {
    _path: new RegExp("^\\/" + route.path.replace(/^\/|\/$/g, "") + "\\/[^\\/]+\\/?$"),
    _locale: getLocale(locale),
  },
}))
console.log(navQuery.value)

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

function reload() {
  window.location.reload()
}
</script>
