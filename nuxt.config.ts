import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

export default defineNuxtConfig({
  devtools: { enabled: true },

  site: {
    url: "https://solsynth.dev",
    name: "Solsynth LLC",
  },
  sitemap: {
    sources: [
      "/api/sitemap/posts",
    ],
  },

  css: ["@/assets/index.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://solsynth.dev",
      solarRealmId: 2,
      solarNetworkApi: "https://api.sn.solsynth.dev",
      solianUrl: "https://sn.solsynth.dev",
    },
  },

  app: {
    head: {
      title: "Solsynth LLC",
      titleTemplate: "%s | Solsynth",
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Noto+Sans+JP:wght@100..900&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+TC:wght@100..900&display=swap",
        },
      ],
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

  pinia: {
    storesDirs: ['./stores/**'],
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@unocss/nuxt",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@pinia/nuxt",
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
