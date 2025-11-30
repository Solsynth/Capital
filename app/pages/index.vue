<template>
  <main class="container mx-auto h-full px-8 flex flex-col gap-24 pb-24">
    <!-- Hero Section -->
    <div
      class="text-center min-h-[80vh] flex flex-col items-center justify-center relative isolate"
    >
      <!-- Background decoration -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"
      ></div>

      <nuxt-img src="/favicon.png" class="w-32 h-32 mb-8 animate-float" />
      <h1 class="text-6xl font-extrabold mb-6 tracking-tight">
        We <span ref="typedElement" class="text-primary" />
      </h1>
      <p class="text-2xl mb-10 opacity-80 max-w-2xl">
        We are a group of friends that make software, hardware and any stuff
        that is interesting.
      </p>
      <n-space justify="center" size="large">
        <n-button
          type="primary"
          size="large"
          round
          tag="a"
          href="#products"
          class="px-8 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
        >
          Explore Products
        </n-button>
        <n-button size="large" round tag="a" href="/about" class="px-8 text-lg">
          About Us
        </n-button>
      </n-space>

      <div class="absolute bottom-10 animate-bounce">
        <n-icon
          size="32"
          class="opacity-50"
          :component="ArrowDownwardOutlined"
        />
      </div>
    </div>

    <!-- Products Section -->
    <div id="products" class="scroll-mt-24">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4">Our Creations</h2>
        <p class="text-xl opacity-70 max-w-2xl mx-auto">
          From social networks to cloud drives, we build tools that empower and
          connect.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <n-card
          v-for="product in products"
          :key="product.path"
          class="product-card"
          content-style="padding: 0"
        >
          <div class="relative aspect-video overflow-hidden group">
            <img
              :src="product.background"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90"
            ></div>

            <div
              class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                <n-icon :component="CodeRound" color="black"></n-icon>
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
                <n-icon :component="LaunchRound" color="black"></n-icon>
              </n-button>
              <nuxt-link
                v-if="product.hasPage"
                :to="`/products/${product.stem.split('/').pop()}`"
              >
                <n-button circle color="white" size="small">
                  <n-icon :component="InfoRound" color="black"></n-icon>
                </n-button>
              </nuxt-link>
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-6">
              <div class="flex items-center gap-3 mb-2">
                <nuxt-img
                  :src="product.icon"
                  class="w-10 h-10 rounded-lg shadow-sm"
                />
                <h3 class="text-xl font-bold text-white">
                  {{ product.name }}
                </h3>
              </div>
              <p class="text-gray-200 text-sm line-clamp-2">
                {{ product.description }}
              </p>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- About Teaser Section -->
    <div class="py-16">
      <n-card
        class="bg-linear-to-r from-primary/10 to-secondary/10 border-0 overflow-hidden relative"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"
        ></div>
        <div
          class="flex flex-col md:flex-row items-center gap-12 relative z-10 p-8"
        >
          <div class="flex-1">
            <h2 class="text-3xl font-bold mb-4">More Than Just Code</h2>
            <p class="text-lg opacity-80 mb-6 leading-relaxed">
              We are a community-driven team focused on creating meaningful
              experiences. Our mission goes beyond software—it's about
              connection, innovation, and fun.
            </p>
            <n-button type="primary" ghost size="large" tag="a" href="/about">
              Read Our Story
              <template #icon>
                <n-icon :component="ChevronRightOutlined"></n-icon>
              </template>
            </n-button>
          </div>
          <div class="flex-1 flex justify-center">
            <!-- Abstract representation or team collage could go here -->
            <div class="grid grid-cols-2 gap-4 opacity-80">
              <div
                class="w-32 h-32 rounded-2xl bg-primary/20 animate-pulse"
              ></div>
              <div
                class="w-32 h-32 rounded-2xl bg-secondary/20 animate-pulse delay-75"
              ></div>
              <div
                class="w-32 h-32 rounded-2xl bg-info/20 animate-pulse delay-150"
              ></div>
              <div
                class="w-32 h-32 rounded-2xl bg-success/20 animate-pulse delay-300"
              ></div>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </main>
</template>

<script setup>
import { NSpace, NButton, NIcon, NCard } from "naive-ui";
import {
  LaunchRound,
  CodeRound,
  ChevronRightOutlined,
  ArrowDownwardOutlined,
  InfoRound,
} from "@vicons/material";
import Typed from "typed.js";

const route = useRoute();
const typedElement = ref(null);
const typed = shallowRef(null);

useHead({
  title: "We are Solsynth",
  titleTemplate: "%s",
});

onMounted(() => {
  if (typedElement.value) {
    if (typed.value) {
      typed.value.destroy();
    }
    typed.value = new Typed(typedElement.value, {
      strings: [
        "make software",
        "make hardware",
        "craft experiences",
        "write stories",
        "are Solsynth",
      ],
      typeSpeed: 50,
      backDelay: 1500,
      backSpeed: 30,
      smartBackspace: true,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      autoInsertCss: true,
    });
  }
});

onUnmounted(() => {
  if (typed.value) {
    typed.value.destroy();
    typed.value = null;
  }
});

const { data: products } = await useAsyncData(route.path, () => {
  return queryCollection("products").all();
});
</script>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

.product-card {
  height: 100%;
  transform: translateY(0);
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  border: none;
  background-color: rgba(
    255,
    255,
    255,
    0.5
  ); /* Example, adjust base color as needed */
  backdrop-filter: blur(4px); /* For backdrop-blur-sm */

  &:hover {
    transform: translateY(-0.5rem); /* For -translate-y-2 */
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04); /* For shadow-xl */
  }
}
</style>
