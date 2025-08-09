// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      title: "Solsynth",
      titleTemplate: "%s - Solsynth",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
  scripts: {
    globals: {
      umami: {
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "eef151fb-07e2-461b-8b7f-2547aab735d4",
        defer: true,
      },
    },
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
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxtjs/tailwindcss",
    "nuxtjs-naive-ui",
    "@vueuse/nuxt",
    "@eschricht/nuxt-color-mode",
  ],
});
