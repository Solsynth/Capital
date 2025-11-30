<template>
  <div class="flex flex-col min-h-screen">
    <header
      class="navbar bg-transparent shadow-lg fixed top-0 left-0 right-0 backdrop-blur-2xl z-1000 h-[64px]"
    >
      <div class="container mx-auto flex items-center justify-between px-5">
        <nuxt-link-locale to="/">
          <nuxt-img src="/favicon.png" alt="Solsynth" class="w-8 h-8" />
        </nuxt-link-locale>

        <n-menu
          v-if="breakpoints.isGreaterOrEqual('md')"
          v-model:value="activeKey"
          mode="horizontal"
          :options="menuOptions"
          style="width: auto"
        />
        <n-popover v-else trigger="hover">
          <template #trigger>
            <n-button text>
              <template #icon>
                <n-icon :component="MenuOutlined" />
              </template>
            </n-button>
          </template>
          <n-menu
            v-model:value="activeKey"
            mode="vertical"
            :options="menuOptions"
            class="w-64"
            style="height: auto"
          />
        </n-popover>

        <div class="flex gap-4">
          <naive-color-mode-switch />
          <n-dropdown
            trigger="hover"
            :options="localeDropdownOptions"
            @select="handleLocaleSelect"
          >
            <n-button text>{{ locale.toUpperCase().split("-")[0] }}</n-button>
          </n-dropdown>
        </div>
      </div>
    </header>

    <main class="grow mt-[64px]">
      <slot />
    </main>

    <footer
      class="footer sm:footer-horizontal bg-base-200 text-base-content p-10"
    >
      <aside>
        <nuxt-img src="/favicon.png" alt="Solsynth" class="w-12 h-12" />
        <div>
          <h3 class="text-lg font-bold">{{ t("common.solsynth") }}</h3>
          {{ t("layout.default.footer.tagline") }}
        </div>
      </aside>
      <nav>
        <h6 class="footer-title">{{ t("layout.default.footer.products") }}</h6>
        <a href="https://solian.app" target="_blank" class="link link-hover">{{
          t("layout.default.footer.solarNetwork")
        }}</a>
        <nuxt-link-locale to="/products" class="link link-hover">{{
          t("layout.default.footer.catalog")
        }}</nuxt-link-locale>
      </nav>
      <nav>
        <h6 class="footer-title">{{ t("layout.default.footer.company") }}</h6>
        <nuxt-link-locale to="/about" class="link link-hover">{{
          t("layout.default.footer.about")
        }}</nuxt-link-locale>
        <a
          href="https://github.com/Solsynth"
          target="_blank"
          class="link link-hover"
          >{{ t("layout.default.footer.github") }}</a
        >
      </nav>
      <nav>
        <h6 class="footer-title">{{ t("layout.default.footer.legal") }}</h6>
        <nuxt-link-locale to="/terms/user-agreement" class="link link-hover">{{
          t("layout.default.footer.tos")
        }}</nuxt-link-locale>
        <nuxt-link-locale to="/terms/privacy-policy" class="link link-hover">{{
          t("layout.default.footer.privacy")
        }}</nuxt-link-locale>
        <nuxt-link-locale to="/terms/refund-policy" class="link link-hover">{{
          t("layout.default.footer.refund")
        }}</nuxt-link-locale>
        <nuxt-link-locale to="/terms" class="link link-hover">{{
          t("layout.default.footer.allDocs")
        }}</nuxt-link-locale>
      </nav>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { MenuOption } from "naive-ui";
import { NIcon, NAvatar, NMenu, NDropdown, NButton } from "naive-ui";
import { computed, h } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ExploreOutlined,
  CategoryOutlined,
  MenuOutlined,
} from "@vicons/material";
import { breakpointsTailwind } from "@vueuse/core";

const router = useRouter();
const switchLocalePath = useSwitchLocalePath();
const { t, locale, locales } = useI18n();

const localeDropdownOptions = computed(() => {
  return locales.value?.map((l: any) => ({
    label: l.name,
    key: l.code,
  }));
});

const handleLocaleSelect = (key: string) => {
  router.push(switchLocalePath(key as any));
};

const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);

const { data: recentProducts } = await useAsyncData("recent-products", () =>
  queryCollection("products").order("updatedDate", "DESC").limit(5).all(),
);

const activeKey = computed(() => {
  // Map route paths to menu keys
  if (route.path === "/") return "explore";
  if (route.path.startsWith("/products")) return "products";
  return null;
});

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function renderLabel(label: string, route: string) {
  const localePrefix = locale.value == "en" ? "" : `/${locale.value}`;
  return () =>
    h(RouterLink, { to: localePrefix + route }, { default: () => label });
}

function renderExternalLabel(label: string, url: string) {
  return () =>
    h("a", { href: url, target: "_blank" }, { default: () => label });
}

const menuOptions = computed<MenuOption[]>(() => {
  const productChildren =
    recentProducts.value?.map((product: any) => {
      const id = product.stem.split("/").pop();
      const hasPage = product.hasPage;
      const url = hasPage ? `/products/${id}` : product.url;

      return {
        label: hasPage
          ? renderLabel(product.name, url)
          : renderExternalLabel(product.name, url),
        key: `product-${id}`,
        icon: product.icon
          ? () =>
              h(NAvatar, {
                src: product.icon,
                size: 24,
                style: { backgroundColor: "transparent" },
              })
          : renderIcon(CategoryOutlined), // Fallback icon, ideally use product.icon if possible but requires NAvatar
      };
    }) || [];

  return [
    {
      label: renderLabel(t("layout.default.menu.explore"), "/"),
      key: "explore",
      icon: renderIcon(ExploreOutlined),
    },
    {
      label: renderLabel(t("layout.default.menu.products"), "/products"),
      key: "products",
      icon: renderIcon(CategoryOutlined),
      children: productChildren,
    },
  ];
});
</script>
