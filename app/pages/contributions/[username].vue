<script setup lang="ts">
import {
  User,
  GitPullRequest,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  Unlink,
  CircleDot,
  GitCommitHorizontal,
  FileCheck,
} from "@lucide/vue";

const { t } = useI18n();
const route = useRoute();
const username = computed(() => route.params.username as string);

const { data: profile, status } = await useAsyncData(
  `contribution-${username.value}`,
  () => $fetch<any>(`/api/contribution/${username.value}`),
);

useSeoMeta({
  title: () =>
    profile.value
      ? `${profile.value.solarDisplayName} — ${t("seo.contributions.title")}`
      : t("seo.contributions.title"),
  description: () =>
    profile.value
      ? `${profile.value.solarDisplayName}'s contribution profile on Solsynth.`
      : "",
});
</script>

<template>
  <div class="min-h-[calc(100dvh-200px)]">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!profile"
      class="flex flex-col items-center justify-center py-24"
    >
      <User class="w-12 h-12 mb-4 text-base-content/20" />
      <p class="text-lg opacity-60">{{ t("contributions.profileNotFound") }}</p>
    </div>

    <template v-else>
      <!-- Hero header -->
      <div class="relative">
        <!-- Background -->
        <div
          v-if="profile.background"
          class="h-48 md:h-56 bg-cover bg-center -mt-(--site-page-offset,64px)"
          :style="{ backgroundImage: `url(${profile.background})` }"
        />
        <div
          v-else
          class="h-56 md:h-56 bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20"
        />

        <!-- Content overlay -->
        <div class="container mx-auto max-w-3xl px-6">
          <div class="relative -mt-12 mb-6 flex items-end gap-4">
            <!-- Avatar -->
            <div class="shrink-0 pt-6">
              <img
                v-if="profile.avatar"
                :src="profile.avatar"
                :alt="profile.solarDisplayName"
                class="w-24 h-24 rounded-2xl object-cover ring-4 ring-base-100 shadow-lg"
              />
              <div
                v-else
                class="w-24 h-24 rounded-2xl bg-base-300 flex items-center justify-center ring-4 ring-base-100 shadow-lg"
              >
                <span class="text-3xl font-bold text-base-content/30">{{
                  profile.solarDisplayName?.[0] ?? "?"
                }}</span>
              </div>
            </div>

            <!-- Name + links -->
            <div class="min-w-0 pb-1">
              <h1 class="text-2xl font-bold truncate">
                {{ profile.solarDisplayName }}
              </h1>
              <div class="flex items-center gap-3 mt-1 flex-wrap">
                <a
                  :href="`https://solian.app/@${profile.solarUsername}`"
                  target="_blank"
                  rel="noopener"
                  class="text-sm text-primary/70 hover:text-primary transition-colors"
                >
                  @{{ profile.solarUsername }}
                </a>
                <a
                  v-if="profile.githubUsername"
                  :href="`https://github.com/${profile.githubUsername}`"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content transition-colors"
                >
                  <img
                    :src="`https://github.com/${profile.githubUsername}.png`"
                    :alt="profile.githubUsername"
                    class="w-5 h-5 rounded-full"
                  />
                  {{ profile.githubUsername }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="container mx-auto max-w-3xl px-6 pb-16">
        <!-- Not linked -->
        <div v-if="!profile.linked" class="alert">
          <Unlink class="w-5 h-5" />
          <span>{{ t("contributions.notLinked") }}</span>
        </div>

        <template v-else>
          <!-- Stats grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div
              class="card bg-base-200/60 border border-base-content/5 p-4 text-center"
            >
              <component
                :is="profile.claSigned ? CheckCircle : XCircle"
                class="w-6 h-6 mx-auto mb-1.5"
                :class="
                  profile.claSigned ? 'text-success' : 'text-base-content/30'
                "
              />
              <p class="text-xs font-medium">
                {{
                  profile.claSigned
                    ? t("contributions.claSigned")
                    : t("contributions.claNotSigned")
                }}
              </p>
            </div>

            <div
              class="card bg-base-200/60 border border-base-content/5 p-4 text-center"
            >
              <GitPullRequest class="w-6 h-6 mx-auto mb-1.5 text-info" />
              <p class="text-xl font-bold tabular-nums">
                {{ profile.prCount }}
              </p>
              <p class="text-xs opacity-50">
                {{ t("contributions.pullRequests") }}
              </p>
            </div>

            <div
              class="card bg-base-200/60 border border-base-content/5 p-4 text-center"
            >
              <CircleDot class="w-6 h-6 mx-auto mb-1.5 text-warning" />
              <p class="text-xl font-bold tabular-nums">
                {{ profile.issueCount }}
              </p>
              <p class="text-xs opacity-50">{{ t("contributions.issues") }}</p>
            </div>

            <div
              class="card bg-base-200/60 border border-base-content/5 p-4 text-center"
            >
              <GitCommitHorizontal
                class="w-6 h-6 mx-auto mb-1.5 text-success"
              />
              <p class="text-xl font-bold tabular-nums">
                {{ profile.commitCount }}
              </p>
              <p class="text-xs opacity-50">{{ t("contributions.commits") }}</p>
            </div>
          </div>

          <!-- Heatmap -->
          <ContributionHeatmap v-if="profile.githubUsername" :username="profile.solarUsername" class="mb-6" />

          <!-- CLA status card -->
          <div
            class="card border p-5 mb-6"
            :class="
              profile.claSigned
                ? 'bg-success/5 border-success/20'
                : 'bg-base-200/60 border-base-content/5'
            "
          >
            <div class="flex items-center gap-3">
              <FileCheck
                class="w-5 h-5"
                :class="
                  profile.claSigned ? 'text-success' : 'text-base-content/40'
                "
              />
              <div>
                <p class="text-sm font-medium">
                  {{
                    profile.claSigned
                      ? t("cla.alreadySigned")
                      : t("contributions.signClaPrompt")
                  }}
                </p>
                <p v-if="profile.claSigned" class="text-xs opacity-60">
                  {{
                    profile.signedAt
                      ? new Date(profile.signedAt).toLocaleDateString()
                      : ""
                  }}
                </p>
                <p v-else class="text-xs opacity-60">
                  {{ t("contributions.signClaPromptDesc") }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
