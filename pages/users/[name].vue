<template>
  <v-container class="content-container mx-auto">
    <v-img v-if="urlOfBanner" :src="urlOfBanner" :aspect-ratio="16 / 5" class="rounded-md mb-3" cover />

    <div class="mx-[2.5ch]">
      <div class="my-5 flex flex-row gap-4">
        <v-avatar :image="urlOfAvatar" />
        <div class="flex flex-col">
          <span>{{ account?.nick }} <span class="text-xs">@{{ account?.name }}</span></span>
          <span class="text-sm">{{ account?.description }}</span>
        </div>
      </div>

      <div class="mb-5 text-xs text-grey flex flex-col">
        <span>Solar Network User Web Preview</span>
        <span>
          To get full view of this user's profile, open it on <a class="underline" :href="externalOpenLink">Solian</a>
        </span>
      </div>

      <div>
        <h1 class="text-xl">{{ t("userActivity") }}</h1>
        <span>{{ t("userActivityCaption") }}</span>
      </div>
    </div>

    <post-list v-if="account" :author="account.name" />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ["/@:name(.*)*"],
})

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const { data: account } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/auth/users/${route.params.name}`)

if (account.value == null) {
  throw createError({
    statusCode: 404,
    statusMessage: "User Not Found",
  })
}

const urlOfAvatar = computed(() => account.value?.avatar ? `${config.public.solarNetworkApi}/cgi/files/attachments/${account.value.avatar}` : void 0)
const urlOfBanner = computed(() => account.value?.banner ? `${config.public.solarNetworkApi}/cgi/files/attachments/${account.value.banner}` : void 0)

const externalOpenLink = computed(() => `${config.public.solianUrl}/accounts/view/${route.params.name}`)
</script>

<style scoped>
.content-container {
  max-width: 70ch !important;
}
</style>
