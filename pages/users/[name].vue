<template>
  <v-container class="mx-auto">
    <v-img v-if="urlOfBanner" :src="urlOfBanner" :aspect-ratio="16 / 5" class="rounded-md mb-3" cover />

    <div class="mx-[2.5ch]">
      <div class="my-5 mx-4 flex flex-row gap-4">
        <v-avatar :image="urlOfAvatar" />
        <div class="flex flex-col">
          <span>{{ account?.nick }} <span class="text-xs">@{{ account?.name }}</span></span>
          <span class="text-sm">{{ account?.description }}</span>
        </div>
      </div>

      <div class="mb-7">
        <v-card rounded="xl" class="mx-[-5px]">
          <v-tabs
            v-model="tab"
            align-tabs="start"
            color="primary"
            hide-slider
          >
            <v-tab :value="1">{{ t("userActivity") }}</v-tab>
          </v-tabs>
        </v-card>
      </div>

      <v-row>
        <v-col row="12" lg="8">
          <post-list class="mx-[-2.5ch] mt-[-16px]" v-if="account" :author="account.name" />
        </v-col>
        <v-col row="12" lg="4" order="first" order-lg="last">
          <div class="sticky top-0 h-fit">
            <v-card prepend-icon="mdi-identifier" title="About">
              <v-card-text>
                <p><b>Description</b></p>
                <p>{{ account.description }}</p>
                <p class="mt-3"><b>Joined At</b></p>
                <p>{{ new Date(account.created_at).toLocaleString() }}</p>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ["/@:name(.*)*"],
})

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const tab = ref(1)

const { data: account } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/id/users/${route.params.name}`)

if (account.value == null) {
  throw createError({
    statusCode: 404,
    statusMessage: "User Not Found",
  })
}

const urlOfAvatar = computed(() => account.value?.avatar ? `${config.public.solarNetworkApi}/cgi/uc/attachments/${account.value.avatar}` : void 0)
const urlOfBanner = computed(() => account.value?.banner ? `${config.public.solarNetworkApi}/cgi/uc/attachments/${account.value.banner}` : void 0)

const externalOpenLink = computed(() => `${config.public.solianUrl}/accounts/view/${route.params.name}`)
</script>
