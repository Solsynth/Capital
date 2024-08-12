<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn flat exact v-bind="props" icon>
        <v-avatar color="transparent" icon="mdi-account-circle" :image="avatar" />
      </v-btn>
    </template>

    <v-list density="compact" v-if="!id.userinfo.isLoggedIn">
      <v-list-item title="Sign in" prepend-icon="mdi-login-variant" to="/auth/sign-in" />
      <v-list-item title="Create account" prepend-icon="mdi-account-plus" to="/auth/sign-up" />
    </v-list>
    <v-list density="compact" v-else>
      <v-list-item :title="nickname" :subtitle="username" />

      <v-divider class="border-opacity-50 my-2" />

      <v-list-item title="Dashboard" prepend-icon="mdi-account-supervisor" exact to="/users/me" />
      <v-list-item title="Sign out" prepend-icon="mdi-logout" @click="signOut"></v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { defaultUserinfo, useUserinfo } from "@/stores/userinfo"
import { computed } from "vue"

const config = useRuntimeConfig()

const id = useUserinfo()

const username = computed(() => {
  if (id.userinfo.isLoggedIn) {
    return "@" + id.userinfo.data?.name
  } else {
    return "@visitor"
  }
})
const nickname = computed(() => {
  if (id.userinfo.isLoggedIn) {
    return id.userinfo.data?.nick
  } else {
    return "Anonymous"
  }
})
const avatar = computed(() => {
  return id.userinfo.data?.avatar ? `${config.public.solarNetworkApi}/cgi/files/attachments/${id.userinfo.data?.avatar}` : void 0
})

function signOut() {
  useCookie("__hydrogen_atk", { watch: "shallow" }).value = null
  useCookie("__hydrogen_rtk", { watch: "shallow" }).value = null
  id.userinfo = defaultUserinfo
  reloadNuxtApp()
}
</script>
