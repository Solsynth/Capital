<template>
  <v-container class="content-container mx-auto">
    <v-img v-if="urlOfBanner" :src="urlOfBanner" :aspect-ratio="16 / 5" class="rounded-md mb-3" cover />

    <div class="mx-[2.5ch]">
      <div class="my-5 flex flex-row gap-4">
        <v-avatar :image="urlOfAvatar" />
        <div class="flex flex-col">
          <span>{{ auth.userinfo.data?.nick }} <span class="text-xs">@{{ auth.userinfo.data?.name }}</span></span>
          <span class="text-sm">{{ auth.userinfo.data?.description }}</span>
        </div>
      </div>

      <div class="mb-5">
        <div class="mx-[2.5ch]">
          <h2 class="text-xl">Personalize</h2>
          <span class="text-sm">Bring your own color to the Solar Network.</span>
        </div>

        <v-alert
          class="mt-3"
          type="info"
          variant="tonal"
          density="comfortable"
          text="This part of the functionality has been transferred to our application Solian, please download it or open it in your browser. To learn more, please visit the project description page."
        />
      </div>

      <div class="mb-5">
        <div class="mx-[2.5ch]">
          <h2 class="text-xl">Security</h2>
          <span class="text-sm">Guard your Solar Network account.</span>
        </div>

        <account-auth-ticket-table class="mt-3" />
      </div>

      <div class="mb-5 mx-[2.5ch]">
        <copyright service="passport" :centered="false" />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
})

const config = useRuntimeConfig()

const auth = useUserinfo()

const urlOfAvatar = computed(() => auth.userinfo.data?.avatar ? `${config.public.solarNetworkApi}/cgi/files/attachments/${auth.userinfo.data.avatar}` : void 0)
const urlOfBanner = computed(() => auth.userinfo.data?.banner ? `${config.public.solarNetworkApi}/cgi/files/attachments/${auth.userinfo.data.banner}` : void 0)
</script>
