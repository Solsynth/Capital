import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { generateTailwindColorThemes } from "@bg-dev/nuxt-naiveui/utils";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  css: ["~/assets/css/main.css"],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Solsynth",
      titleTemplate: "%s - Solsynth",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
  nitro: {},
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@vueuse/nuxt",
    "@bg-dev/nuxt-naiveui",
  ],
  vite: {
    plugins: [
      tailwindcss(),
      AutoImport({
        imports: [
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
  },
  naiveui: {
    colorModePreference: "system",
    colorModePreferenceCookieName: "fi-ColorMode",
    themeConfig: {
      ...generateTailwindColorThemes(),
      shared: {
        common: {
          fontFamily:
            "Nunito Variable, v-sans, ui-system, -apple-system, sans-serif",
          primaryColor: "#3F51B5FF",
          primaryColorHover: "#5767C1FF",
          primaryColorPressed: "#3546A4FF",
          primaryColorSuppl: "#4C5EC5FF",
          borderRadius: "16px",
          borderRadiusSmall: "8px",
        },
        Input: {
          borderRadius: "8px",
        },
        Select: {
          borderRadius: "8px",
        },
        Dropdown: {
          borderRadius: "8px",
        },
        Button: {
          borderRadius: "8px",
          borderRadiusLarge: "12px",
          borderRadiusMedium: "8px",
          borderRadiusSmall: "4px",
        },
      },
      light: {},
      dark: {},
    },
  },
});
