<template>
  <v-container class="content-container mx-auto">
    <v-img v-if="urlOfBanner" :src="urlOfBanner" :aspect-ratio="16 / 5" class="rounded-md mb-3" cover />

    <div class="mx-[2.5ch]">
      <div class="my-5 flex flex-row gap-4">
        <v-avatar :image="urlOfAvatar" />
        <div class="flex flex-col">
          <span>{{ auth.userinfo?.nick }} <span class="text-xs">@{{ auth.userinfo?.name }}</span></span>
          <span class="text-sm">{{ auth.userinfo?.description }}</span>
        </div>
      </div>

      <div class="mb-5">
        <div class="mx-[2.5ch]">
          <h2 class="text-xl">{{ t("personalize") }}</h2>
          <span class="text-sm">{{ t("personalizeCaption") }}</span>
        </div>

        <v-alert
          class="mt-3"
          type="info"
          variant="tonal"
          density="comfortable"
          :text="t('transferredToSolianHint')"
        />
      </div>

      <div class="mb-5">
        <div class="mx-[2.5ch]">
          <h2 class="text-xl">{{ t("security") }}</h2>
          <span class="text-sm">{{ t("securityCaption") }}</span>
        </div>

        <account-auth-ticket-table class="mt-3" />
      </div>

      <div class="mb-5 mx-[2.5ch]">
        <copyright service="passport" no-centered />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
})

const { t } = useI18n()
const config = useRuntimeConfig()

const auth = useUserinfo()

const urlOfAvatar = computed(() => auth.userinfo?.avatar ? `${config.public.solarNetworkApi}/cgi/files/attachments/${auth.userinfo.avatar}` : void 0)
const urlOfBanner = computed(() => auth.userinfo?.banner ? `${config.public.solarNetworkApi}/cgi/files/attachments/${auth.userinfo.banner}` : void 0)
</script>
