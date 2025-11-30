<template>
  <main class="container mx-auto h-full px-8 flex flex-col gap-16 py-16">
    <!-- Hero Section -->
    <div
      class="text-center flex flex-col items-center justify-center animate-fade-in-up"
    >
      <h1 class="text-5xl font-extrabold mb-6">About Us</h1>
      <p class="text-xl max-w-2xl opacity-80">
        We are a collective of creators, dreamers, and builders.
      </p>
    </div>

    <!-- Mission Section -->
    <section
      class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in-up delay-100"
    >
      <div>
        <h2 class="text-3xl font-bold mb-4">Our Mission</h2>
        <p class="text-lg opacity-90 leading-relaxed">
          Our aim is not making a profit.
          <i class="text-sm opacity-70">At least not yet.</i> <br /><br />
          Instead, we hope we can spread the love to the world and make everyone
          enjoy the fun of the Internet and technology. We believe in open
          source, collaboration, and building things that bring joy.
        </p>
      </div>
      <div class="flex justify-center">
        <n-card class="max-w-sm w-full bg-opacity-50 backdrop-blur-sm">
          <div class="flex flex-col items-center text-center p-4">
            <n-icon size="48" class="mb-4 text-primary">
              <heart-outlined />
            </n-icon>
            <h3 class="text-xl font-bold mb-2">Built with Love</h3>
            <p class="opacity-80">
              Every line of code is written with passion and care.
            </p>
          </div>
        </n-card>
      </div>
    </section>

    <!-- Team Section -->
    <section class="animate-fade-in-up delay-200">
      <h2 class="text-3xl font-bold mb-8 text-center">Meet the Team</h2>
      <div class="flex flex-wrap justify-center gap-8">
        <!-- Team Member Card -->
        <n-card
          class="max-w-xs w-full hover:shadow-lg transition-shadow duration-300"
        >
          <div class="flex flex-col items-center text-center">
            <n-avatar
              src="https://fs.solian.app/api/files/200ee92546244ed1a6a02202f5ca9cc9"
              :size="120"
              class="mb-4 shadow-md"
            />
            <h3 class="text-xl font-bold">LittleSheep</h3>
            <div class="flex items-center gap-2 mt-1 mb-3">
              <n-tag size="small" type="primary" round>Founder</n-tag>
              <n-button
                text
                tag="a"
                size="small"
                href="https://id.solian.app/@littlesheep"
                target="_blank"
              >
                <n-icon size="18">
                  <info-outlined />
                </n-icon>
              </n-button>
            </div>
            <p class="text-sm opacity-75 mb-4">
              Founder, CEO, CTO, Senior Developer, Marketing Engineer, Customer
              Service Engineer, DevOps, Database Administrator, Product Manager,
              UI/UX Designer, QA Engineer, Mobile Developer, Security Engineer,
              Technical Writer, Project Manager, Community Manager, Software
              Architect
            </p>
            <div class="flex gap-3">
              <n-button
                circle
                size="small"
                tag="a"
                href="https://github.com/LittleSheep"
                target="_blank"
              >
                <template #icon
                  ><n-icon><logo-github /></n-icon
                ></template>
              </n-button>
            </div>
          </div>
        </n-card>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { InfoOutlined } from "@vicons/material";

useHead({
  title: "About Us - Solsynth",
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
