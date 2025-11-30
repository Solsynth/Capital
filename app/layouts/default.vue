<template>
  <div class="flex flex-col min-h-screen">
    <header
      class="navbar bg-transparent shadow-lg fixed top-0 left-0 right-0 backdrop-blur-2xl z-1000 h-[64px]"
    >
      <div class="container mx-auto flex items-center justify-between px-5">
        <nuxt-link to="/">
          <nuxt-img src="/favicon.png" alt="Solsynth" class="w-8 h-8" />
        </nuxt-link>

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

        <naive-color-mode-switch />
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
          <h3 class="text-lg font-bold">Solsynth</h3>
          Making software, hardware and experiences since 2024
        </div>
      </aside>
      <nav>
        <h6 class="footer-title">Products</h6>
        <a href="https://solian.app" target="_blank" class="link link-hover"
          >Solar Network</a
        >
        <nuxt-link to="/products" class="link link-hover">Catalog</nuxt-link>
      </nav>
      <nav>
        <h6 class="footer-title">Company</h6>
        <nuxt-link to="/about" class="link link-hover">About us</nuxt-link>
        <a
          href="https://github.com/Solsynth"
          target="_blank"
          class="link link-hover"
          >GitHub</a
        >
      </nav>
      <nav>
        <h6 class="footer-title">Legal</h6>
        <nuxt-link to="/terms/user-agreement" class="link link-hover"
          >Terms of Service</nuxt-link
        >
        <nuxt-link to="/terms/privacy-policy" class="link link-hover"
          >Privacy Policy</nuxt-link
        >
        <nuxt-link to="/terms/refund-policy" class="link link-hover"
          >Refund Policy</nuxt-link
        >
        <nuxt-link to="/terms" class="link link-hover">All Documents</nuxt-link>
      </nav>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { MenuOption } from "naive-ui";
import { NIcon, NAvatar, NMenu } from "naive-ui";
import { computed, h } from "vue";
import { useRoute, RouterLink } from "vue-router";
import {
  ExploreOutlined,
  CategoryOutlined,
  MenuOutlined,
} from "@vicons/material";
import { breakpointsTailwind } from "@vueuse/core";

const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);

const { data: recentProducts } = await useAsyncData("recent-products", () =>
  queryCollection("products").order("updatedDate", "DESC").limit(5).all()
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
  return () => h(RouterLink, { to: route }, { default: () => label });
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
      label: renderLabel("Explore", "/"),
      key: "explore",
      icon: renderIcon(ExploreOutlined),
    },
    {
      label: renderLabel("Products", "/products"),
      key: "products",
      icon: renderIcon(CategoryOutlined),
      children: productChildren,
    },
  ];
});
</script>
