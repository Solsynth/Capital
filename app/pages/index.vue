<template>
  <main class="container mx-auto h-full px-8 flex flex-col gap-16">
    <div class="text-center py-56 flex flex-col items-center justify-center">
      <nuxt-img src="/favicon.png" class="w-28 h-28 mb-4" />
      <h1 class="text-5xl font-extrabold mb-3">We <span id="who-are-we" /></h1>
      <p class="text-xl mb-8">
        We are a group of friends that make software, hardware and any stuff
        that interesting.
      </p>
      <n-space justify="center">
        <n-button type="primary" size="large" round tag="a" href="#products"
          >Explore around</n-button
        >
        <n-button type="default" size="large" round tag="a" href="#about"
          >About us</n-button
        >
      </n-space>
    </div>
    <div id="products" class="pb-56">
      <client-only>
        <n-grid cols="1 m:2 l:2" responsive="screen" x-gap="32" y-gap="16">
          <n-gi>
            <div class="flex items-center justify-center">
              <n-carousel
                show-arrow
                autoplay
                dot-type="line"
                class="rounded-xl w-full max-h-[360px] aspect-video flex-shrink-1"
              >
                <n-carousel-item
                  v-for="product in products"
                  :key="product.path"
                  class="rounded-xl w-full max-h-[360px] aspect-video relative"
                  :style="`background-color: ${product.background ? 'transparent' : themeVar.baseColor}`"
                >
                  <img
                    :src="product.background"
                    class="absolute left-0 right-0 top-0 bottom-0 object-cover aspect-video"
                    style="z-index: -1"
                  />
                  <div
                    style="
                      background: linear-gradient(
                        to top,
                        rgba(0, 0, 0, 0.7),
                        transparent
                      );
                      z-index: 1;
                    "
                    class="absolute left-0 right-0 top-1/2 bottom-0"
                  />
                  <div
                    class="absolute left-0 right-0 top-0 px-4 pt-4 flex justify-end gap-2.5"
                  >
                    <n-button
                      v-if="product.repo"
                      circle
                      color="white"
                      size="small"
                      tag="a"
                      :href="product.repo"
                      target="_blank"
                    >
                      <n-icon><code-round /></n-icon>
                    </n-button>
                    <n-button
                      v-if="product.url"
                      circle
                      color="white"
                      size="small"
                      tag="a"
                      :href="product.url"
                      target="_blank"
                    >
                      <n-icon><launch-round /></n-icon>
                    </n-button>
                  </div>
                  <div
                    class="absolute bottom-0 px-6 py-8 w-full"
                    style="z-index: 2"
                  >
                    <nuxt-img :src="product.icon" class="w-12 h-12" />
                    <p class="text-lg text-white line-height-1">
                      {{ product.name }}
                    </p>
                    <p>{{ product.description }}</p>
                  </div>
                </n-carousel-item>
              </n-carousel>
            </div>
          </n-gi>
          <n-gi>
            <div
              class="flex justify-center text-right h-full py-8 px-4 flex flex-col"
            >
              <h2 class="text-3xl font-bold mb-3">Our products</h2>
              <p class="text-lg mb-1">
                The made various of software, from social network to cloud
                drive.
              </p>
              <p class="text-lg">
                Take a look of them on the left on your own
                <code>ヽ(&gt;∀&lt;☆)ノ</code>
              </p>
            </div>
          </n-gi>
        </n-grid>
      </client-only>
    </div>
    <div id="about" class="pb-56">
      <client-only>
        <n-grid cols="1 m:2 l:2" responsive="screen" x-gap="32" y-gap="16">
          <n-gi>
            <div
              class="flex justify-center text-left h-full py-8 px-4 flex flex-col"
            >
              <h2 class="text-3xl font-bold mb-3">About us</h2>
              <p class="text-lg mb-1">
                Our aim is not making a profit.
                <i class="text-xs">At least not yet.</i>
              </p>
              <p class="text-lg">
                Instead we hope we can spread the love to the world and make
                everyone enjoy the fun of the Internet and the world.
              </p>
            </div>
          </n-gi>
          <n-gi>
            <div class="flex h-full justify-center flex-col text-right">
              <h2 class="text-3xl font-bold mb-3">Team members</h2>
              <p class="text-lg">
                Say hi to our lovely members... uh, seems there is only me.
              </p>
              <div class="flex justify-end gap-4 my-4">
                <div class="flex flex-col items-end text-right">
                  <n-avatar
                    src="https://fs.solian.app/api/files/200ee92546244ed1a6a02202f5ca9cc9"
                    :size="100"
                    class="mb-2"
                  />
                  <div class="flex gap-1">
                    <p>LittleSheep</p>
                    <n-button
                      text
                      tag="a"
                      size="small"
                      href="https://id.solian.app/@littlesheep"
                      target="_blank"
                      class="mt-0.5"
                    >
                      <n-icon>
                        <info-outlined />
                      </n-icon>
                    </n-button>
                  </div>
                  <p class="text-xs opacity-75 max-w-sm">
                    Founder, CEO, CTO, Senior Developer, Marketing Engineer,
                    Customer Service Engineer, DevOps, Database Administrator,
                    Product Manager, UI/UX Designer, QA Engineer, Mobile
                    Developer, Security Engineer, Technical Writer, Project
                    Manager, Community Manager, Software Architect
                  </p>
                </div>
              </div>
            </div>
          </n-gi>
        </n-grid>
      </client-only>
    </div>
  </main>
</template>

<script setup>
import {
  NSpace,
  NButton,
  NGrid,
  NGi,
  NCarousel,
  NCarouselItem,
  NIcon,
  NAvatar,
  useThemeVars,
} from "naive-ui";
import { LaunchRound, CodeRound, InfoOutlined } from "@vicons/material";
import Typed from "typed.js";

const route = useRoute();
const themeVar = useThemeVars();

const { data: products } = await useAsyncData(route.path, () => {
  return queryCollection("products").all();
});

onMounted(() => {
  new Typed("#who-are-we", {
    strings: [
      "make software",
      "make hardware",
      "make experience",
      "write stories",
      "are Solsynth^3000",
    ],
    typeSpeed: 40,
    backDelay: 1000,
    backSpeed: 40,
    smartBackspace: true,
    loop: true,
    showCursor: false,
    autoInsertCss: false,
  });
});
</script>
