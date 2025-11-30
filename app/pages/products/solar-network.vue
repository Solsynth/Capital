<template>
  <main class="min-h-screen overflow-x-hidden transition-colors duration-300">
    <!-- Hero Section -->
    <div
      class="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div
          class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"
        ></div>
        <div
          class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"
        ></div>
      </div>

      <div class="text-center z-10 max-w-4xl mx-auto">
        <div class="mb-8 relative inline-block">
          <div
            class="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse"
          ></div>
          <img
            src="/solar-network/icon.png"
            class="w-32 h-32 relative z-10 animate-float"
            alt="Solar Network Logo"
          />
        </div>

        <h1 class="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Solar Network
        </h1>

        <p class="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
          The next-generation social network designed for
          <span class="text-primary font-semibold">technology enthusiasts</span
          >, <span class="text-secondary font-semibold">developers</span>, and
          <span class="text-info font-semibold">ACG culture</span>.
        </p>

        <n-space justify="center" size="large" class="mb-16">
          <n-button
            type="primary"
            size="large"
            round
            tag="a"
            href="#download"
            class="px-8 py-6 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all download-button"
          >
            Get Started
            <template #icon>
              <n-icon :component="ArrowDownwardRound" />
            </template>
          </n-button>
          <n-button
            size="large"
            round
            secondary
            tag="a"
            href="#features"
            class="px-8 py-6 text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            Learn More
          </n-button>
        </n-space>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 animate-bounce">
        <n-icon size="32" class="text-gray-400 dark:text-gray-500">
          <ArrowDownwardRound />
        </n-icon>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="py-32 px-4 relative">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Why Solar Network?
          </h2>
          <p class="text-xl max-w-2xl mx-auto">
            Built for those who create, code, and connect. Experience a platform
            that understands your passions.
          </p>
        </div>

        <n-grid cols="1 m:2 l:2" responsive="screen" x-gap="32" y-gap="32">
          <n-gi>
            <div class="feature-card group">
              <div class="p-8 h-full flex flex-col">
                <div
                  class="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform"
                >
                  <n-icon size="32" :component="CodeRound" />
                </div>
                <h3 class="text-2xl font-bold mb-4">Developer First</h3>
                <p class="opacity-80 leading-relaxed">
                  Native syntax highlighting, code snippet sharing, and seamless
                  integration with your favorite dev tools.
                </p>
              </div>
            </div>
          </n-gi>
          <n-gi>
            <div class="feature-card group">
              <div class="p-8 h-full flex flex-col">
                <div
                  class="w-14 h-14 rounded-2xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform"
                >
                  <n-icon size="32" :component="ApiRound" />
                </div>
                <h3 class="text-2xl font-bold mb-4">OpenAPI</h3>
                <p class="opacity-80 leading-relaxed">
                  Fully documented API, transparent rate limiting and risk
                  control. Great start for developing your own app with the
                  Solar Network!
                </p>
              </div>
            </div>
          </n-gi>
          <n-gi>
            <div class="feature-card group">
              <div class="p-8 h-full flex flex-col">
                <div
                  class="w-14 h-14 rounded-2xl bg-info/10 dark:bg-info/20 flex items-center justify-center mb-6 text-info group-hover:scale-110 transition-transform"
                >
                  <n-icon size="32" :component="AutoAwesomeRound" />
                </div>
                <h3 class="text-2xl font-bold mb-4">ACG Culture</h3>
                <p class="opacity-80 leading-relaxed">
                  A dedicated space for Anime, Comic, and Game enthusiasts.
                  Share your art, reviews, and passion.
                </p>
              </div>
            </div>
          </n-gi>
          <n-gi>
            <div class="feature-card group">
              <div class="p-8 h-full flex flex-col">
                <div
                  class="w-14 h-14 rounded-2xl bg-success/10 dark:bg-success/20 flex items-center justify-center mb-6 text-success group-hover:scale-110 transition-transform"
                >
                  <n-icon size="32" :component="FavoriteRound" />
                </div>
                <h3 class="text-2xl font-bold mb-4">Friendly Community</h3>
                <p class="opacity-80 leading-relaxed">
                  Join a vibrant community of like-minded individuals. Share
                  your knowledge, ask questions, and connect with others.
                </p>
              </div>
            </div>
          </n-gi>
        </n-grid>

        <!-- Video Showcase -->
        <div
          class="mt-32 relative rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-sm glassy-card"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div class="p-12 flex flex-col justify-center">
              <h3 class="text-3xl font-bold mb-6">Experience the Future</h3>
              <p class="text-lg mb-8">
                Watch our promotional video to see Solar Network in action.
                Discover a fluid, responsive, and beautiful interface designed
                for modern interactions.
              </p>
              <div class="flex gap-4">
                <n-tag type="warning" round :bordered="false">
                  <template #icon
                    ><n-icon :component="ConstructionRound"
                  /></template>
                  Under Construction
                </n-tag>
              </div>
            </div>
            <div
              class="relative aspect-video lg:aspect-auto lg:h-full min-h-[300px]"
            >
              <iframe
                class="absolute inset-0 w-full h-full"
                src="https://www.youtube-nocookie.com/embed/xhK5UBqGw5Q"
                title="Solar Network Promo"
                frameborder="0"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  web-share;
                "
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Download Section -->
    <div
      id="download"
      class="py-32 px-4 bg-linear-to-b from-transparent to-primary/5"
    >
      <div class="container mx-auto max-w-5xl">
        <div class="text-center mb-20">
          <h2 class="text-2xl md:text-3xl font-bold mb-2">
            Start Your Journey
          </h2>
          <p class="text-xl">
            Available on iOS, Android, macOS, Windows, and Linux.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <!-- Faster Release Card -->
          <div
            class="download-card relative overflow-hidden group border-primary/50"
          >
            <div class="absolute top-0 right-0 p-4">
              <n-tag
                type="success"
                round
                :bordered="false"
                class="shadow-lg shadow-success/20"
              >
                <template #icon><n-icon :component="StarRound" /></template>
                Recommended
              </n-tag>
            </div>

            <div class="p-8 flex flex-col h-full relative z-10">
              <div
                class="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
              >
                <n-icon size="36" color="white" :component="IosShareRound" />
              </div>
              <h3 class="text-2xl font-bold mb-2">Faster Release</h3>
              <p class="opacity-80 mb-8 grow">
                Get early access to the latest features on all platforms.
                <br />
                <span class="text-xs opacity-70 mt-2 block">
                  <n-space size="small" align="center">
                    <n-icon :component="LogoApple" />
                    <n-icon :component="LogoAndroid" />
                    <n-icon :component="LogoWindows" />
                    <n-icon :component="LogoTux" />
                  </n-space>
                </span>
              </p>
              <div class="flex flex-col gap-3">
                <n-button
                  type="primary"
                  size="large"
                  block
                  round
                  tag="a"
                  href="https://testflight.apple.com/join/YJ0lmN6O"
                  target="_blank"
                  class="py-6 font-bold"
                >
                  Join TestFlight (iOS)
                  <template #icon><n-icon :component="LaunchRound" /></template>
                </n-button>
                <n-button
                  secondary
                  size="large"
                  block
                  round
                  tag="a"
                  href="https://fs.solsynth.dev/official/solian"
                  target="_blank"
                  class="py-6 font-bold"
                >
                  Direct Download (All)
                  <template #icon
                    ><n-icon :component="CloudDownloadRound"
                  /></template>
                </n-button>
                <n-button
                  tertiary
                  size="large"
                  block
                  round
                  tag="a"
                  href="https://web.solian.app"
                  target="_blank"
                  class="py-2 font-bold text-primary hover:underline"
                >
                  Try Web Version
                  <template #icon><n-icon :component="WebRound" /></template>
                </n-button>
              </div>
            </div>

            <!-- Glow effect -->
            <div
              class="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors duration-500"
            ></div>
          </div>

          <!-- App Store Card -->
          <div class="download-card relative overflow-hidden group">
            <div class="p-8 flex flex-col h-full relative z-10">
              <div
                class="w-16 h-16 rounded-2xl bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center mb-6 shadow-lg"
              >
                <n-icon size="36" color="white" :component="LogoApple" />
              </div>
              <h3 class="text-2xl font-bold mb-2">App Store</h3>
              <p class="opacity-80 mb-8 grow">
                Stable release for general users. Leave a review to support us!
              </p>
              <n-button
                secondary
                size="large"
                block
                round
                tag="a"
                href="https://apps.apple.com/us/app/solian/id6499032345"
                target="_blank"
                class="py-6 font-bold"
              >
                Visit Store Page
                <template #icon><n-icon :component="LaunchRound" /></template>
              </n-button>
            </div>
          </div>
        </div>

        <!-- Latest Release Info -->
        <div v-if="latestRelease.data.value" class="max-w-2xl mx-auto">
          <div
            class="download-card rounded-2xl p-6 border backdrop-blur-md flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white"
              >
                <n-icon :size="24" :component="LogoGithub" />
              </div>
              <div>
                <div
                  class="text-xs opacity-80 uppercase tracking-wider font-bold mb-1"
                >
                  Latest Release
                </div>
                <div class="font-mono text-primary font-bold">
                  {{ latestRelease.data.value?.tag_name }}
                </div>
              </div>
            </div>
            <n-button
              text
              tag="a"
              :href="latestRelease.data.value?.html_url"
              target="_blank"
            >
              View on GitHub
              <template #icon
                ><n-icon :component="ArrowForwardRound"
              /></template>
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer / Support -->
    <div class="py-24 bg-primary/5">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold mb-2">Need Help?</h2>
        <p class="mb-12 text-lg">
          Feel free to contact your customer service or report a bug on the
          GitHub.
        </p>
        <div class="flex flex-wrap justify-center gap-8">
          <a
            href="https://github.com/Solsynth/Solian/issues"
            target="_blank"
            class="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white shadow-sm"
          >
            <n-icon :component="LogoGithub" size="24" />
            <span class="font-semibold">Report an Issue</span>
          </a>
          <a
            href="mailto:lily@solsynth.dev"
            class="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white shadow-sm"
          >
            <n-icon :component="MailOutlineRound" size="24" />
            <span class="font-semibold">Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { NSpace, NButton, NGrid, NGi, NIcon, NTag } from "naive-ui";
import { Octokit } from "@octokit/rest";
import {
  LaunchRound,
  StarRound,
  ArrowDownwardRound,
  CodeRound,
  AutoAwesomeRound,
  ConstructionRound,
  IosShareRound,
  ArrowForwardRound,
  MailOutlineRound,
  CloudDownloadRound,
  WebRound,
  ApiRound,
  FavoriteRound,
} from "@vicons/material";
import {
  LogoGithub,
  LogoApple,
  LogoAndroid,
  LogoWindows,
  LogoTux,
} from "@vicons/ionicons5";

useHead({
  title: "Solar Network - Stay Connected",
  meta: [
    {
      name: "description",
      content:
        "The amazing social network for technology, programming, and ACG fans.",
    },
  ],
});

const latestRelease = useAsyncData("sn-latest-release", async () => {
  const octo = new Octokit({});
  const resp = await octo.repos.getLatestRelease({
    owner: "Solsynth",
    repo: "Solian",
  });
  return resp.data;
});
</script>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

.feature-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  height: 100%;
}

.dark .feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.dark .feature-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.glassy-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 2rem;
  transition: all 0.3s ease;
}

.dark .glassy-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.download-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 2rem;
  transition: all 0.3s ease;
}

.dark .download-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.download-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
}

.dark .download-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
}

.download-button {
  transition:
    transform 0.3s ease,
    top 0.1s ease;
}

.download-button:hover {
  transform: translateY(-0.25rem); /* Equivalent to hover:-translate-y-1 */
}
</style>
