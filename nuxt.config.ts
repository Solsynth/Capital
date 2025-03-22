import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

export default defineNuxtConfig({
  devtools: { enabled: true },

  site: {
    url: "https://solsynth.dev",
    name: "Solsynth LLC",
  },
  sitemap: {
    strictNuxtContentPaths: true,
    cacheMaxAgeSeconds: 3600,
    sitemapsPathPrefix: "/sitemap",
    sitemaps: {
      pages: {
        includeAppSources: true,
        exclude: ["/flow/**"],
        defaults: { priority: 0.8 },
      },
      posts: {
        includeAppSources: false,
        sources: ["/api/sitemap/posts"],
      },
    },
  },

  i18n: {
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieCrossOrigin: true,
      cookieKey: "__capital_i18n",
      redirectOn: "no prefix",
    },
    locales: [
      { code: "en", name: "English", file: "en-US.json" },
      { code: "zh-CN", name: "简体中文", file: "zh-CN.json" },
    ],
    lazy: true,
    langDir: "lang",
    defaultLocale: "en",
  },

  css: ["~/assets/index.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://solsynth.dev",
      solarRealm: "solar-network",
      solarNetworkApi: "https://api.sn.solsynth.dev",
      solianUrl: "https://sn.solsynth.dev",
    },
  },

  routeRules: {
    "/.well-known/openid-configuration": {
      proxy: "/api/well-known/openid-configuration",
    },
  },

  app: {
    baseURL: "https://solsynth.dev",
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Solsynth LLC",
      titleTemplate: "%s | Solsynth",
      meta: [],
      link: [{ rel: "icon", type: "image/png", href: "/icon.png" }],
    },
  },

  content: {
    api: {
      baseURL: "/api/content",
    },
    highlight: {
      theme: { default: "github-light", dark: "github-dark" },
      langs: [
        "json",
        "yaml",
        "toml",
        "java",
        "javascript",
        "astro",
        "css",
        "scss",
        "dart",
        "go",
        "typescript",
        "c",
        "csharp",
        "cpp",
        "bat",
        "bash",
        "sh",
        "dockerfile",
        "erlang",
        "fsharp",
        "markdown",
        "log",
        "lua",
        "objc",
        "swift",
        "regex",
        "ruby",
        "rust",
        "postcss",
        "blade",
        "asciidoc",
        "cmake",
        "cobol",
        "pascal",
        "nginx",
        "angular-html",
        "angular-ts",
        "gdscript",
        "gdshader",
        "gdresource",
        "groovy",
        "gql",
        "python",
        "crystal",
        "sql",
        "plsql",
        "kotlin",
        "html",
        "vue",
        "gleam",
        "julia",
        "lisp",
        "xml",
        "csv",
      ],
    },
    locales: ["en", "zh-CN"],
    defaultLocale: "en",
  },

  pinia: {
    storesDirs: ["./stores/**"],
  },

  build: {
    transpile: ["vuetify"],
  },

  umami: {
    id: "eef151fb-07e2-461b-8b7f-2547aab735d4",
    host: "https://us.umami.is",
    autoTrack: true,
  },

  modules: [
    "@unocss/nuxt",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "nuxt-schema-org",
    "@vueuse/motion/nuxt",
    "nuxt-umami",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],

  gtag: {
    id: "G-ZFJ7RX0JXF",
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  compatibilityDate: "2024-08-10",
})
