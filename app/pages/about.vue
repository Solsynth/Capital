<template>
  <main
    class="container max-w-2xl text-center mx-auto h-full px-8 flex flex-col gap-16 py-16"
  >
    <!-- Hero Section -->
    <div
      class="text-center flex flex-col items-center justify-center animate-fade-in-up"
    >
      <h1 class="text-4xl font-extrabold mb-3">About Us</h1>
      <p class="text-xl max-w-2xl opacity-80">
        We are a collective of creators, dreamers, and builders.
      </p>
    </div>

    <!-- Mission Section -->
    <section
      class="flex flex-col gap-12 items-center animate-fade-in-up delay-100"
    >
      <div>
        <h2 class="text-2xl font-bold">Our Mission</h2>
        <div class="text-lg opacity-90 leading-relaxed flex flex-col gap-2">
          <p>
            Our aim is not making a profit.
            <i class="text-sm opacity-70">At least not yet.</i>
          </p>
          <p>
            Instead, we hope we can spread the love to the world and make
            everyone enjoy the fun of the Internet and technology. We believe in
            open source, collaboration, and building things that bring joy.
          </p>
        </div>
      </div>
      <div class="flex justify-center">
        <n-card class="max-w-sm w-full bg-opacity-50 backdrop-blur-sm">
          <div class="flex flex-col items-center text-center p-4">
            <n-icon
              size="48"
              class="mb-4 text-primary"
              :component="FavoriteRound"
            />
            <h3 class="text-xl font-bold mb-2">Built with Love</h3>
            <p class="opacity-80">
              Every line of code is written with passion and care in mind.
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
          v-for="member in team"
          :key="member.name"
          class="max-w-xs w-full hover:shadow-lg transition-shadow duration-300"
        >
          <div class="flex flex-col items-center text-center">
            <n-avatar :src="member.avatar" :size="120" class="mb-4 shadow-md" />
            <h3 class="text-xl font-bold">{{ member.name }}</h3>
            <div class="flex items-center gap-2 mt-1 mb-3">
              <n-tag size="small" type="primary" round>{{ member.role }}</n-tag>
              <n-button
                v-if="member.profileUrl"
                text
                tag="a"
                size="small"
                :href="member.profileUrl"
                target="_blank"
              >
                <n-icon size="18">
                  <info-outlined />
                </n-icon>
              </n-button>
            </div>
            <p class="text-sm opacity-75 mb-4">
              {{ member.bio }}
            </p>
            <div class="flex gap-3" v-if="member.socials">
              <n-button
                v-for="social in member.socials"
                :key="social.url"
                circle
                size="small"
                tag="a"
                :href="social.url"
                target="_blank"
              >
                <template #icon>
                  <n-icon :component="getIcon(social.icon)" />
                </template>
              </n-button>
            </div>
          </div>
        </n-card>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { InfoOutlined, FavoriteRound, CodeRound } from "@vicons/material";

useHead({
  title: "About Us",
});

const { data: team } = await useAsyncData("team", () =>
  queryCollection("team").all()
);

function getIcon(name: string) {
  switch (name) {
    case "github":
      return CodeRound;
    default:
      return InfoOutlined;
  }
}
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
