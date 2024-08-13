<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn flat exact v-bind="props" icon>
        <v-avatar v-if="id.isReady" color="transparent" icon="mdi-account-circle" :image="avatar" />
        <v-progress-circular v-else indeterminate size="20" width="2.5" />
      </v-btn>
    </template>

    <v-list density="compact" v-if="id.isLoggedIn">
      <v-list-item :title="nickname" :subtitle="username" />

      <v-divider class="border-opacity-50 my-2" />

      <v-list-item :title="t('userMenuDashboard')" prepend-icon="mdi-account-supervisor" exact to="/users/me" />
      <v-list-item :title="t('userMenuSignOut')" prepend-icon="mdi-logout" @click="signOut"></v-list-item>
    </v-list>
    <v-list density="compact" v-else>
      <v-list-item :title="t('userMenuSignIn')" prepend-icon="mdi-login-variant" to="/auth/sign-in" />
      <v-list-item :title="t('userMenuSignUp')" prepend-icon="mdi-account-plus" to="/auth/sign-up" />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useUserinfo } from "@/stores/userinfo"
import { computed } from "vue"

const {t} = useI18n()
const config = useRuntimeConfig()

const id = useUserinfo()

const username = computed(() => {
  if (id.isLoggedIn) {
    return "@" + id.userinfo?.name
  } else {
    return "@visitor"
  }
})
const nickname = computed(() => {
  if (id.isLoggedIn) {
    return id.userinfo?.nick
  } else {
    return "Anonymous"
  }
})
const avatar = computed(() => {
  return id.userinfo?.avatar ? `${config.public.solarNetworkApi}/cgi/files/attachments/${id.userinfo?.avatar}` : void 0
})

function signOut() {
  useCookie("__hydrogen_atk", { watch: "shallow" }).value = null
  useCookie("__hydrogen_rtk", { watch: "shallow" }).value = null
  id.userinfo = null
  reloadNuxtApp()
}
</script>
