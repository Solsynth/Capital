<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    :theme="theme.value === 'dark' ? darkTheme : lightTheme"
  >
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
  </n-config-provider>
</template>

<script setup lang="ts">
import {
  darkTheme,
  lightTheme,
  NConfigProvider,
  NGlobalStyle,
  NLoadingBarProvider,
  NDialogProvider,
  NMessageProvider,
} from "naive-ui";

import '@fontsource-variable/nunito';

const themeOverrides = {
  common: {
    fontFamily: "Nunito Variable, v-sans, ui-system, -apple-system, sans-serif",
    primaryColor: "#7D80BAFF",
    primaryColorHover: "#9294C5FF",
    primaryColorPressed: "#575B9DFF",
    primaryColorSuppl: "#6B6FC1FF",
  },
};

const theme = useColorMode();
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
  font-family: Nunito Variable, sans-serif;
}
</style>
