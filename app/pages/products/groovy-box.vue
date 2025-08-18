<template>
  <main class="container mx-auto h-full px-8 flex flex-col gap-16">
    <div class="text-center py-56 flex flex-col items-center justify-center">
      <img src="/groovy-box/icon.png" class="w-28 h-28 mb-4" />
      <h1 class="text-5xl font-extrabold mb-3">聆阁</h1>
      <p class="text-xl mb-8">
        一个简单，实用，美观的专为 iPad 设计的，Swift 制成的音乐播放器。
      </p>
      <n-alert
        type="warning"
        title="Under Construction"
        class="max-w-lg mx-auto mb-8"
        closable
      >
        <n-marquee>
          <div style="margin-right: 64px">
            小羊懒得施工产品介绍，所以懂得都懂。不懂得我也不好多说，如果你真的知道可以去看下面的开发日志。
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
              <h2 class="text-3xl font-bold mb-3">功能</h2>
              <p class="text-lg mb-1">上面说了，懂懂的都懂</p>
              <p class="text-md">
                如果你看得懂这行字就说明你有可能访问不了
                YouTube，你可以去哔哩哔哩上搜一下 「LittleSheep」 去看我的
                Devlog 我懒得放链接了（
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
              <h2 class="text-3xl font-bold mb-3">下载</h2>
              <p class="text-lg mb-1">获取最新版本的聆阁</p>
            </div>
          </n-gi>
          <n-gi>
            <div class="flex items-center justify-center flex-col gap-4">
              <n-card title="iOS / macOS">
                <div class="grid gird-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col">
                    <div class="mb-3">
                      <n-tag round :bordered="false" type="success">
                        推荐
                        <template #icon>
                          <n-icon :component="StarRound" />
                        </template>
                      </n-tag>
                    </div>
                    <h3 class="text-lg font-bold">通过 TestFlight 下载</h3>
                    <p>最新版本，最新功能，中国可用。</p>
                    <n-button
                      type="primary"
                      tag="a"
                      target="_blank"
                      round
                      class="mt-4"
                      href="https://testflight.apple.com/join/N3Yswzvv"
                    >
                      加入 TestFlight
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
                        不太推荐
                        <template #icon>
                          <n-icon :component="StarOutlineRound" />
                        </template>
                      </n-tag>
                    </div>
                    <h3 class="text-lg font-bold">通过 App Store 下载</h3>
                    <p>
                      可以留评论，提高聆阁的知名度。不确定中国能不能用。但是目前还没上架
                    </p>
                    <n-button
                      type="primary"
                      tag="a"
                      target="_blank"
                      round
                      class="mt-4"
                      href="#"
                      disabled
                    >
                      去 App Store
                      <template #icon>
                        <n-icon>
                          <launch-round />
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>
              </n-card>
              <n-card title="源代码">
                <p>在 GitHub 上开源</p>
                <n-button
                  type="primary"
                  tag="a"
                  target="_blank"
                  round
                  class="mt-4"
                  href="https://github.com/littlesheep2code/listening"
                >
                  去 GitHub 查看源代码
                  <template #icon>
                    <n-icon>
                      <launch-round />
                    </n-icon>
                  </template>
                </n-button>
              </n-card>
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
              <h2 class="text-3xl font-bold mb-3">反馈和支持</h2>
              <p class="text-lg mb-1">
                如果您有任何想法或问题，请随时告诉我们！
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
                如果功能上除了什么问题，欢迎去 GitHub 提交 issue！
              </n-card>
              <n-card
                title="客户服务"
                hoverable
                href="mailto:lily@solsynth.dev"
                target="_blank"
                tag="a"
              >
                如果有任何其他相关的问题，请通过电子邮件与我们的客服联系
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
import { LaunchRound, StarOutlineRound, StarRound } from "@vicons/material";

useHead({
  title: "聆阁",
});
</script>
