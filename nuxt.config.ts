import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { generateTailwindColorThemes } from "@bg-dev/nuxt-naiveui/utils";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Solsynth",
      titleTemplate: "%s - Solsynth",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@vueuse/nuxt",
    "@bg-dev/nuxt-naiveui",
    "@nuxtjs/i18n",
  ],
  i18n: {
    langDir: ".",
    strategy: "prefix_except_default",
    locales: [
      {
        code: "en",
        name: "English",
        file: "en.json",
      },
      {
        code: "zh-cn",
        name: "简体中文",
        file: "zh-cn.json",
      },
    ],
    defaultLocale: "en",
  },
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
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      wrangler: {
        d1_databases: [
          {
            binding: "DB",
            database_name: "capital-content",
            database_id: "73d65123-3c42-4dc9-b540-8e89678962a2",
          },
        ],
      },
    },
  },
  content: {
    database: {
      type: "d1",
      bindingName: "DB",
    },
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
