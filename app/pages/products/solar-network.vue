<template>
  <main class="container mx-auto h-full px-8 flex flex-col gap-16">
    <div class="text-center py-56 flex flex-col items-center justify-center">
      <img src="/solar-network/icon.png" class="w-28 h-28 mb-4" />
      <h1 class="text-5xl font-extrabold mb-3">Solar Network</h1>
      <p class="text-xl mb-8">
        The amazing social network for technology, programming, ACG fans.
      </p>
      <n-alert
        type="warning"
        title="Under Construction"
        class="max-w-lg mx-auto mb-8"
        closable
      >
        <n-marquee>
          <div style="margin-right: 64px">
            小羊懒得施工产品介绍，所以懂得都懂。不懂得我也不好多说，如果你真的知道可以去看我们的宣传片，如果你连宣传片都不知道在哪里的话我也不知道怎么办了。
          </div>
        </n-marquee>
      </n-alert>
      <n-space justify="center">
        <n-button type="primary" size="large" round tag="a" href="#features">
          Explore features
        </n-button>
        <n-button type="default" size="large" round tag="a" href="#download">
          Download
        </n-button>
      </n-space>
    </div>
    <div id="features" class="pb-56">
      <client-only>
        <n-grid cols="1 m:2 l:2" responsive="screen" x-gap="32" y-gap="16">
          <n-gi>
            <div class="flex items-center justify-center">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube-nocookie.com/embed/xhK5UBqGw5Q"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          </n-gi>
          <n-gi>
            <div
              class="flex justify-center text-right h-full py-8 px-4 flex-col"
            >
              <h2 class="text-3xl font-bold mb-3">Features</h2>
              <p class="text-lg mb-1">
                As the alert described, this part is under construction. For now
                you can check out the video on the left.
              </p>
              <p class="text-md">
                如果你看得懂这行字就说明你有可能访问不了
                YouTube，你可以去哔哩哔哩上搜一下 「Solar Network」
                我懒得放链接了（
              </p>
            </div>
          </n-gi>
        </n-grid>
      </client-only>
    </div>
    <div id="download" class="pb-56">
      <client-only>
        <n-grid cols="1 m:2 l:2" responsive="screen" x-gap="32" y-gap="16">
          <n-gi>
            <div
              class="flex justify-center text-left h-full py-8 px-4 flex-col"
            >
              <h2 class="text-3xl font-bold mb-3">Download</h2>
              <p class="text-lg mb-1">
                Get the latest version of Solar Network for your device.
              </p>
              <p class="text-lg">
                File-hosting & versioning by
                <a
                  class="underline"
                  href="https://github.com/Solsynth/Solian"
                  target="_blank"
                  >GitHub</a
                >
              </p>
            </div>
          </n-gi>
          <n-gi>
            <div class="flex items-center justify-center flex-col gap-4">
              <n-card title="iOS / macOS">
                <div class="grid gird-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col">
                    <div class="mb-3">
                      <n-tag round :bordered="false" type="success">
                        Recommended
                        <template #icon>
                          <n-icon :component="StarRound" />
                        </template>
                      </n-tag>
                    </div>
                    <h3 class="text-lg font-bold">Download via TestFlight</h3>
                    <p>
                      Latest version, new features and bug fixes. 中国可用。
                    </p>
                    <n-button
                      type="primary"
                      tag="a"
                      target="_blank"
                      round
                      class="mt-4"
                      href="https://testflight.apple.com/join/YJ0lmN6O"
                    >
                      Join TestFlight
                      <template #icon>
                        <n-icon>
                          <launch-round />
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                  <div class="flex flex-col">
                    <div class="mb-3">
                      <n-tag round :bordered="false" type="info">
                        Not that recommended
                        <template #icon>
                          <n-icon :component="StarOutlineRound" />
                        </template>
                      </n-tag>
                    </div>
                    <h3 class="text-lg font-bold">Download via App Store</h3>
                    <p>
                      Can leave reviews to increase the popularity of the Solar
                      Network.
                    </p>
                    <n-button
                      type="primary"
                      tag="a"
                      target="_blank"
                      round
                      class="mt-4"
                      href="https://apps.apple.com/us/app/solian/id6499032345"
                    >
                      Go to App Store
                      <template #icon>
                        <n-icon>
                          <launch-round />
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>
              </n-card>
              <n-card v-if="latestRelease.data.value" title="Latest Release">
                <p>
                  <code>{{ latestRelease.data.value?.tag_name }}</code>
                </p>
                <p class="font-bold text-lg">
                  {{ latestRelease.data.value?.name }}
                </p>
                <n-button
                  type="primary"
                  tag="a"
                  target="_blank"
                  round
                  class="mt-4"
                  :href="latestRelease.data.value?.html_url"
                >
                  Go to GitHub and Download
                  <template #icon>
                    <n-icon>
                      <launch-round />
                    </n-icon>
                  </template>
                </n-button>
              </n-card>
              <a href="https://web.solian.app" target="_blank">
                <n-tag round :bordered="false" size="small" class="cursor-pointer">
                  Open the web version (Strongly not recommended, only for
                  preview)
                  <template #icon>
                    <n-icon :component="WebRound" />
                  </template>
                </n-tag>
              </a>
            </div>
          </n-gi>
        </n-grid>
      </client-only>
    </div>
    <div id="download" class="pb-56">
      <client-only>
        <n-grid cols="1 m:2 l:2" responsive="screen" x-gap="32" y-gap="16">
          <n-gi>
            <div
              class="flex justify-center text-left h-full py-8 px-4 flex-col"
            >
              <h2 class="text-3xl font-bold mb-3">Feedback & Support</h2>
              <p class="text-lg mb-1">
                Due to the Solar Network always under active development, if you
                have any idea or issues. Feel free to told us!
              </p>
            </div>
          </n-gi>
          <n-gi>
            <div class="flex items-center justify-center flex-col gap-4">
              <n-card
                title="GitHub Issues"
                hoverable
                href="https://github.com/Solsynth/Solian/issues"
                target="_blank"
                tag="a"
              >
                If you have any new idea or function that don't work as
                expected. Go to GitHub and create an issue to feedback!
              </n-card>
              <n-card
                title="Customer Service"
                hoverable
                href="mailto:lily@solsynth.dev"
                target="_blank"
                tag="a"
              >
                If you have any account and payments related problems, please
                contact our customer service via email at
                <address class="font-italic">lily [at] solsynth.dev</address>
              </n-card>
            </div>
          </n-gi>
        </n-grid>
      </client-only>
    </div>
  </main>
</template>

<script lang="ts" setup>
import {
  NSpace,
  NButton,
  NGrid,
  NGi,
  NCard,
  NAlert,
  NIcon,
  NMarquee,
  NTag,
} from "naive-ui";
import { Octokit } from "@octokit/rest";
import {
  LaunchRound,
  StarOutlineRound,
  StarRound,
  WebRound,
} from "@vicons/material";

useHead({
  title: "Solar Network",
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
