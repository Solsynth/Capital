<template>
  <div>
    <h2 class="mb-4 text-xl font-bold tracking-tight">
      {{ t('updates.replies') }}
    </h2>

    <ClientOnly>
      <!--
        SunkenLand widgets (registered/configured by `app/plugins/sunkenland.client.ts`).
        Slot children must be light-DOM siblings carrying a `slot` attribute —
        Vue's `<template #…>` named slots do not compile on custom elements.
      -->
      <sk-reply-composer
        :post="postId"
        :placeholder="t('updates.replyPlaceholder')"
        :submit-label="t('updates.replySubmit')"
      >
        <span
          slot="sign-in"
          class="block w-full rounded-xl border border-base-300/40 bg-base-200/30 px-4 py-3 text-center text-sm text-base-content/60"
        >
          <NuxtLink class="link link-primary" :to="localePath('/auth/login')">
            {{ t('login.title') }}
          </NuxtLink>
          {{ t('updates.signInToReply') }}
        </span>
      </sk-reply-composer>

      <sk-replies-list
        :post="postId"
        :take="20"
        :header="false"
        :view-all-url="viewAllUrl"
        class="update-replies-list"
      >
        <span slot="loading">{{ t('updates.loading') }}</span>
        <span slot="empty">{{ t('updates.noReplies') }}</span>
        <span slot="load-more">{{ t('updates.loadMore') }}</span>
        <span slot="view-all">{{ t('updates.viewAllReplies') }}</span>
      </sk-replies-list>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  postId: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const viewAllUrl = computed(() => `https://solian.app/posts/${props.postId}`)
</script>

<style>
/* Custom elements are inline by default, and the preset leaves the gap
   between the composer and the thread to the host. */
.update-replies-list {
  display: block;
  margin-top: 1rem;
}
</style>
