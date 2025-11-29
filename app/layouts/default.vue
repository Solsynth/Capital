<template>
  <div class="flex flex-col min-h-screen">
    <header
      class="navbar bg-transparent shadow-lg fixed top-0 left-0 right-0 backdrop-blur-2xl z-1000 h-[64px]"
    >
      <div class="container mx-auto flex items-center justify-between px-5">
        <div class="flex gap-2 items-center">
          <router-link to="/">
            <nuxt-img src="/favicon.png" alt="Solsynth" class="w-10 h-8" />
          </router-link>

          <n-menu
            v-model:value="activeKey"
            mode="horizontal"
            :options="menuOptions"
          />
        </div>

        <n-dropdown :options="dropdownOptions" @select="handleDropdownSelect">
          <n-avatar :size="32">
            <n-icon :component="PersonIcon" :size="20" />
          </n-avatar>
        </n-dropdown>
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
        <p>
          Solsynth
          <br />
          Making software, hardware and experiences since 2024
        </p>
      </aside>
      <nav>
        <h6 class="footer-title">Products</h6>
        <router-link to="/products" class="link link-hover"
          >Our Products</router-link
        >
        <router-link to="/#about" class="link link-hover">About Us</router-link>
      </nav>
      <nav>
        <h6 class="footer-title">Company</h6>
        <a
          href="https://github.com/Solsynth"
          target="_blank"
          class="link link-hover"
          >GitHub</a
        >
        <router-link to="/#about" class="link link-hover">Team</router-link>
      </nav>
      <nav>
        <h6 class="footer-title">Legal</h6>
        <router-link to="/terms/user-agreement" class="link link-hover"
          >Terms of Service</router-link
        >
        <router-link to="/terms/privacy-policy" class="link link-hover"
          >Privacy Policy</router-link
        >
        <router-link to="/terms/refund-policy" class="link link-hover"
          >Refund Policy</router-link
        >
        <router-link to="/terms" class="link link-hover"
          >All Documents</router-link
        >
      </nav>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { MenuOption } from "naive-ui";
import { NIcon, NAvatar, NMenu, NDropdown } from "naive-ui";
import { computed, h } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import {
  ExploreOutlined,
  DashboardOutlined,
  LogInOutlined,
  PersonAddOutlined,
  PersonOutlined,
} from "@vicons/material";

const router = useRouter();
const route = useRoute();

const PersonIcon = PersonOutlined;

const activeKey = computed(() => {
  // Map route paths to menu keys
  if (route.path === "/") return "explore";
  return null;
});

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function renderLabel(label: string, route: string) {
  return () => h(RouterLink, { to: route }, { default: () => label });
}

const menuOptions: MenuOption[] = [
  {
    label: renderLabel("Explore", "/"),
    key: "explore",
    icon: renderIcon(ExploreOutlined),
  },
];

const dropdownOptions = computed(() => {
  // For now, show login/signup options
  // TODO: Add user authentication state check
  return [
    {
      label: "Login",
      key: "/auth/login",
      icon: renderIcon(LogInOutlined),
    },
    {
      label: "Create Account",
      key: "/auth/create-account",
      icon: renderIcon(PersonAddOutlined),
    },
  ];
});

function handleDropdownSelect(key: string) {
  router.push(key);
}
</script>
