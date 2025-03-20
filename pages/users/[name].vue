<template>
  <v-container class="mx-auto">
    <v-img v-if="urlOfBanner" :src="urlOfBanner" :aspect-ratio="16 / 5" class="rounded-md mb-3" cover />

    <div class="mx-[2.5ch]">
      <div class="my-5 mx-4 flex flex-row gap-4">
        <v-avatar :image="urlOfAvatar" />
        <div class="flex flex-col">
          <span
            >{{ account?.nick }} <span class="text-xs">@{{ account?.name }}</span></span
          >
          <p>
            {{ accountStatus.status ? accountStatus.status.label : accountStatus["is_online"] ? "Online" : "Offline" }}
          </p>
        </div>
      </div>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card>
            <v-card-text v-if="accountPageStatus.valueOf() === 'success'">
              <div class="prose prose-sm" style="max-width: unset">
                <m-d-c :value="accountPage.content" />
              </div>
            </v-card-text>
            <v-card-text v-else>
              <p class="font-italic">The user has no account page.</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" lg="4" order="first" order-lg="last">
          <div class="sticky top-0 h-fit">
            <v-card prepend-icon="mdi-identifier" title="About">
              <v-card-text>
                <p><b>Description</b></p>
                <p>{{ account?.profile.description }}</p>
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
const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const { data: account } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/id/users/${route.params.name}`)

if (account.value == null) {
  throw createError({
    statusCode: 404,
    statusMessage: "User Not Found",
  })
}

const { data: accountPage, status: accountPageStatus } = await useFetch<any>(
  `${config.public.solarNetworkApi}/cgi/id/users/${route.params.name}/page`,
)
const { data: accountStatus, status: accountStatusStatus } = await useFetch<any>(
  `${config.public.solarNetworkApi}/cgi/id/users/${route.params.name}/status`,
)

const urlOfAvatar = computed(() =>
  account.value?.avatar ? `${config.public.solarNetworkApi}/cgi/uc/attachments/${account.value.avatar}` : void 0,
)
const urlOfBanner = computed(() =>
  account.value?.banner ? `${config.public.solarNetworkApi}/cgi/uc/attachments/${account.value.banner}` : void 0,
)
</script>
