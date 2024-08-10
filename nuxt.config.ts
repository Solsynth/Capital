import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      title: "Solsynth LLC",
      titleTemplate: "%s | Solsynth",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },

  content: {
    api: {
      baseURL: "/api/content",
    },
    highlight: {
      theme: "github-dark",
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@unocss/nuxt",
    "@nuxt/content",
    "@nuxt/image",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  compatibilityDate: "2024-08-10",
})