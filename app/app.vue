<template>
  <naive-config>
    <n-global-style />
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider placement="bottom">
          <nuxt-layout>
            <nuxt-page />
          </nuxt-layout>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </naive-config>
</template>

<script setup lang="ts">
import {
  NGlobalStyle,
  NLoadingBarProvider,
  NDialogProvider,
  NMessageProvider,
} from "naive-ui";

import "@fontsource-variable/nunito";
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
  font-family:
    Nunito Variable,
    sans-serif;

  scroll-behavior: smooth;
}

.n-layout-scroll-container {
  scroll-behavior: smooth;
}
</style>
