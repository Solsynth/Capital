<template>
  <ClientOnly>
    <!--
      SunkenLand widget (registered/configured by `app/plugins/sunkenland.client.ts`).
      It talks to Stargate directly and cannot read the Nitro session cookie, so
      the plugin hands it the signed-in user's Solar token through `getAccessToken`.
    -->
    <sk-reaction-list
      :post="postId"
      :max-visible="maxVisible"
      :react-label="t('updates.reactLabel')"
    >
      <!--
        Signed-out visitors who click a chip send the widget into its own
        Solarpass flow, which this site has no registered OIDC client for.
        Capital's better-auth login is the supported path, so it replaces the
        widget's configuration error instead of leaking it.
      -->
      <span slot="error" class="text-sm">
        <NuxtLink class="link link-primary" :to="localePath('/auth/login')">
          {{ t('updates.signInToReact') }}
        </NuxtLink>
      </span>
    </sk-reaction-list>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{
  postId: string
  maxVisible?: number
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
