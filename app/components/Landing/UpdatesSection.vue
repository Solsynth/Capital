<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { getPosts, getRealmPosts, getAttachmentUrl } = useApi();

const { data: officialPosts } = await useAsyncData(
  "updates-home-official",
  () => getPosts(6, 0),
);
const { data: communityPosts } = await useAsyncData(
  "updates-home-community",
  () => getRealmPosts("solsynth", 6, 0),
);

const activeTab = ref<"official" | "community">("official");

const sections = computed(() => [
  {
    key: "official" as const,
    label: t("home.updates.officialTitle"),
    posts: officialPosts.value ?? [],
  },
  {
    key: "community" as const,
    label: t("home.updates.communityTitle"),
    posts: communityPosts.value ?? [],
  },
]);

const current = computed(() =>
  sections.value.find((section) => section.key === activeTab.value),
);

// A dated log row rather than a card: the page already carries photographs in
// the hero and every product page, so the news feed stays typographic.
function stamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale.value === "zh" ? "zh-CN" : "en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

// A post without a title prints its opening words as the line; the excerpt is
// then omitted rather than repeating the same sentence under it.
const TITLE_WORDS = 90;

function flatten(content: string): string {
  return (content ?? "")
    .replace(/[#*`>_\-\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.lastIndexOf(" ", limit);
  return `${text.slice(0, cut > 0 ? cut : limit).trimEnd()}…`;
}

function displayTitle(post: { title: string; content: string }): string {
  return post.title?.trim() || clip(flatten(post.content), TITLE_WORDS);
}

function excerpt(post: { title: string; content: string }): string {
  if (!post.title?.trim()) return "";
  return clip(flatten(post.content), 130);
}

function cover(post: {
  attachments: Array<{
    id: string;
    mime_type?: string;
    file_meta?: { mime_type?: string };
  }>;
}): string | null {
  const first = post.attachments?.[0];
  if (!first) return null;
  const mime = first.mime_type ?? first.file_meta?.mime_type ?? "";
  return mime.startsWith("image/") ? getAttachmentUrl(first.id) : null;
}

function publisherName(post: { publisher?: { nick?: string } }): string {
  return post.publisher?.nick || "Solsynth";
}

function initials(name: string): string {
  if (!name || name === "Unknown") return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
</script>

<template>
  <section class="updates">
    <div class="shell">
      <div class="updates-head">
        <h2 class="updates-title">
          {{ t("home.updates.title") }}
        </h2>

        <!-- A capsule rail, the console's tab form: the active tab is filled,
             not underlined. -->
        <div class="rail" role="tablist" :aria-label="t('home.updates.title')">
          <button
            v-for="section in sections"
            :key="section.key"
            type="button"
            role="tab"
            class="rail-tab"
            :class="{ 'is-current': activeTab === section.key }"
            :aria-selected="activeTab === section.key"
            @click="activeTab = section.key"
          >
            {{ section.label }}
          </button>
        </div>
      </div>

      <ol v-if="current?.posts.length" class="log">
        <li v-for="post in current.posts" :key="post.id" class="log-row">
          <NuxtLink :to="localePath(`/updates/${post.id}`)" class="log-link">
            <time class="mono log-date" :datetime="post.published_at">{{
              stamp(post.published_at)
            }}</time>

            <span class="log-body">
              <span class="log-title">{{ displayTitle(post) }}</span>
              <span v-if="excerpt(post)" class="log-excerpt">{{
                excerpt(post)
              }}</span>
              <span class="log-meta">
                <span v-if="post.publisher?.picture" class="log-avatar">
                  <img
                    :src="getAttachmentUrl(post.publisher.picture.id)"
                    :alt="''"
                    loading="lazy"
                    decoding="async"
                    class="rounded-xl"
                  />
                </span>
                <span v-else class="log-avatar" aria-hidden="true">
                  {{ initials(publisherName(post)) }}
                </span>
                {{ publisherName(post) }}
                <template v-if="post.tags?.length">
                  <span class="log-sep" aria-hidden="true">/</span>
                  {{
                    post.tags
                      .slice(0, 2)
                      .map((tag) => tag.name || tag.slug)
                      .join(", ")
                  }}
                </template>
              </span>
            </span>

            <span v-if="cover(post)" class="log-thumb" aria-hidden="true">
              <img :src="cover(post)!" alt="" loading="lazy" decoding="async" />
            </span>
          </NuxtLink>
        </li>
      </ol>

      <p v-else-if="!current?.posts.length" class="log-empty">
        {{ t("updates.noUpdates") }}
      </p>

      <div class="updates-foot">
        <NuxtLink :to="localePath('/updates')" class="updates-all">
          {{ t("home.updates.viewAll") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.updates {
  padding-block: 4rem 0;
}

.updates-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  margin-bottom: 1.75rem;
}

.updates-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.rail {
  display: inline-flex;
  gap: 0.125rem;
  padding: 0.1875rem;
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-200) 45%, transparent);
}

.rail-tab {
  padding: 0.35rem 0.8rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-faint);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.rail-tab:hover {
  color: var(--color-base-content);
}

.rail-tab.is-current {
  background: var(--color-base-300);
  color: var(--color-base-content);
}

.rail-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.log {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.log-row {
  border-bottom: 1px solid var(--color-line-soft);
}

.log-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  padding: 1.1rem 0.5rem 1.1rem 0;
  color: inherit;
  text-decoration: none;
  transition: background-color 140ms ease;
}

.log-link:hover {
  background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
}

.log-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.log-date {
  color: var(--color-faint);
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.log-title {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-base-content);
  letter-spacing: -0.005em;
}

.log-link:hover .log-title {
  color: var(--color-primary);
}

.log-excerpt {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: var(--color-faint);
}

.log-avatar {
  display: inline-flex;
  width: 1.125rem;
  height: 1.125rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-base-300) 80%, transparent);
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  color: var(--color-dim);
}

.log-sep {
  color: var(--color-line);
}

.log-thumb {
  display: none;
}

.log-empty {
  margin: 0;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.updates-foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

.updates-all {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-dim);
  text-decoration: none;
  transition: color 140ms ease;
}

.updates-all:hover,
.updates-all:focus-visible {
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .updates-title {
    font-size: 1.5rem;
  }

  .log-link {
    grid-template-columns: 6.5rem minmax(0, 1fr) 7rem;
    align-items: start;
    gap: 1.5rem;
    padding-block: 1.15rem;
  }

  .log-date {
    padding-top: 0.2rem;
  }

  .log-thumb {
    display: block;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    border-radius: var(--radius-mark);
    background: var(--color-base-300);
  }

  .log-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
