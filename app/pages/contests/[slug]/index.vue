<script setup lang="ts">
import {
  Trophy,
  ArrowLeft,
  Tag,
  ExternalLink,
  FileText,
  Vote,
} from "@lucide/vue";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const slug = computed(() => route.params?.slug as string);

const { data: contest } = await useAsyncData(
  `contest-${locale.value}-${slug.value}`,
  async () => {
    const allContests = await queryCollection("contests")
      .where("path", "LIKE", `/contests/${locale.value}/%`)
      .all();
    return (
      allContests.find(
        (c) => c.path === `/contests/${locale.value}/${slug.value}`,
      ) || null
    );
  },
);

const { data: dbData } = await useAsyncData(`contest-db-${slug.value}`, () => {
  return $fetch(`/api/contests/${slug.value}`);
});

if (!contest.value) {
  navigateTo(localePath("/contests"));
}

const phaseLabel = computed(() => {
  const phase = dbData.value?.state?.phase;
  if (phase === "dev") return t("contests.phase.dev");
  if (phase === "voting") return t("contests.phase.voting");
  if (phase === "results") return t("contests.phase.results");
  return "";
});

const canSubmit = computed(() => {
  if (!dbData.value?.state) return false;
  return (
    dbData.value.state.status !== "past" &&
    dbData.value.state.phase !== "results" &&
    dbData.value.state.submissionEnabled
  );
});

const canVote = computed(() => {
  if (!dbData.value?.state) return false;
  return dbData.value.state.votingEnabled;
});

const submissionCount = computed(() => dbData.value?.submissionCount || 0);

const contestStatus = computed(
  () => dbData.value?.state?.status || contest.value?.status || "upcoming",
);

function statusLabel(status: string) {
  const key = `contests.statusLabel.${status}`;
  const label = t(key);
  return label !== key ? label : status.charAt(0).toUpperCase() + status.slice(1);
}
</script>

<template>
  <div v-if="contest">
    <!-- Hero -->
    <div class="relative min-h-[50vh] flex items-end">
      <template v-if="contest.coverImage">
        <img
          :src="contest.coverImage"
          :alt="contest.title"
          class="absolute inset-0 w-full h-full object-cover -mt-(--site-page-offset,64px)"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/80 to-base-100/30 -mt-(--site-page-offset,64px)"
        />
      </template>
      <div
        v-else
        class="absolute inset-0 bg-linear-to-br from-primary/10 to-secondary/10"
      />

      <div class="relative container mx-auto px-4 py-12">
        <NuxtLink
          :to="localePath('/contests')"
          class="btn btn-ghost btn-sm mb-6 inline-flex"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          {{ t('contests.backToContests') }}
        </NuxtLink>

        <div class="flex items-center gap-3 mb-4">
          <span
            class="badge badge-lg"
            :class="{
              'badge-primary': contestStatus === 'upcoming',
              'badge-secondary': contestStatus === 'ongoing',
              'badge-ghost': contestStatus === 'past',
            }"
          >
            {{ statusLabel(contestStatus) }}
          </span>
          <span v-if="phaseLabel" class="badge badge-outline badge-lg">
            {{ phaseLabel }}
          </span>
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {{ contest.title }}
        </h1>
        <p class="text-lg opacity-80 max-w-3xl">
          {{ contest.description }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 py-12">
      <!-- Phase Actions -->
      <div class="flex flex-wrap gap-3 mb-8">
        <NuxtLink
          v-if="canSubmit"
          :to="localePath(`/contests/${slug}/submit`)"
          class="btn btn-primary"
        >
          <FileText class="w-4 h-4 mr-2" />
          {{ t('contests.submitProject') }}
        </NuxtLink>
        <NuxtLink
          v-if="canVote"
          :to="localePath(`/contests/${slug}/submissions`)"
          class="btn btn-secondary"
        >
          <Vote class="w-4 h-4 mr-2" />
          {{ t('contests.vote') }}
        </NuxtLink>
          <NuxtLink
            :to="localePath(`/contests/${slug}/submissions`)"
            class="btn btn-outline"
          >
            {{ t('contests.viewSubmissions') }}
            <span v-if="submissionCount > 0" class="badge badge-sm ml-2">
              {{ submissionCount }}
            </span>
          </NuxtLink>
          <NuxtLink
            :to="localePath(`/contests/${slug}/mine`)"
            class="btn btn-ghost"
          >
            {{ t('contests.mySubmissions') }}
          </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Rules -->
          <section v-if="contest.rules && contest.rules.length > 0">
            <h2 class="text-2xl font-bold mb-4">{{ t('contests.rules') }}</h2>
            <ul class="space-y-2">
              <li
                v-for="(rule, idx) in contest.rules"
                :key="idx"
                class="flex items-start gap-3"
              >
                <span class="badge badge-sm badge-outline mt-0.5">{{
                  idx + 1
                }}</span>
                <span class="opacity-80">{{ rule }}</span>
              </li>
            </ul>
          </section>

          <!-- Prizes -->
          <section v-if="contest.prizes && contest.prizes.length > 0">
            <h2 class="text-2xl font-bold mb-4">{{ t('contests.prizes') }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="prize in contest.prizes"
                :key="prize.place"
                class="card bg-base-200 border border-base-300"
              >
                <div class="card-body p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <Trophy class="w-4 h-4 text-primary" />
                    <span class="font-bold">{{ prize.place }}</span>
                  </div>
                  <p class="text-sm opacity-70">{{ prize.reward }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="card bg-base-200 sticky top-4">
            <div class="card-body">
              <h3 class="card-title text-lg">{{ t('contests.contestInfo') }}</h3>

              <div class="space-y-4 mt-4">
                <div class="flex items-start gap-3">
                  <FileText class="w-5 h-5 mt-0.5 opacity-70" />
                  <div>
                    <p class="font-medium">{{ t('contests.viewSubmissions') }}</p>
                    <p class="text-sm opacity-70">
                      {{ submissionCount }} {{ t('contests.accepted') }}
                    </p>
                  </div>
                </div>

                <div v-if="dbData?.state" class="flex items-start gap-3">
                  <Vote class="w-5 h-5 mt-0.5 opacity-70" />
                  <div>
                    <p class="font-medium">{{ t('contests.currentPhase') }}</p>
                    <p class="text-sm opacity-70">{{ phaseLabel }}</p>
                  </div>
                </div>
              </div>

              <div
                v-if="dbData?.userSubmission"
                class="mt-6 pt-4 border-t border-base-300"
              >
                <p class="text-sm font-medium mb-2">{{ t('contests.yourSubmission') }}</p>
                <span
                  class="badge"
                  :class="{
                    'badge-warning': dbData.userSubmission.status === 'pending',
                    'badge-success':
                      dbData.userSubmission.status === 'accepted',
                    'badge-error': dbData.userSubmission.status === 'rejected',
                  }"
                >
                  {{ statusLabel(dbData.userSubmission.status) }}
                </span>
              </div>

              <div v-if="contest.tags && contest.tags.length > 0" class="mt-6">
                <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag class="w-4 h-4" />
                  {{ t('contests.tags') }}
                </h4>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in contest.tags"
                    :key="tag"
                    class="badge badge-outline badge-xs"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-base-300">
        <NuxtLink :to="localePath('/contests')" class="btn btn-ghost">
          <ArrowLeft class="w-4 h-4 mr-2" />
          {{ t('contests.backToContests') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
