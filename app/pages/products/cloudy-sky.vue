<script setup lang="ts">
import {
  Bell,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Shield,
  Smartphone,
  Wifi,
  Zap,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const PRODUCT_SLUG = 'cloudy-sky'
const REPO_URL = 'https://github.com/Solsynth/CloudySky'

const aboutCards = computed(() => [
  { icon: Bell, title: t('cloudySky.aboutCard.notifications.title'), desc: t('cloudySky.aboutCard.notifications.desc') },
  { icon: Shield, title: t('cloudySky.aboutCard.secure.title'), desc: t('cloudySky.aboutCard.secure.desc') },
  { icon: Zap, title: t('cloudySky.aboutCard.realtime.title'), desc: t('cloudySky.aboutCard.realtime.desc') },
])

const features = computed(() => [
  { icon: Shield, title: t('cloudySky.features.oidc.title'), desc: t('cloudySky.features.oidc.desc') },
  { icon: Zap, title: t('cloudySky.features.sse.title'), desc: t('cloudySky.features.sse.desc') },
  { icon: MessageSquare, title: t('cloudySky.features.grouping.title'), desc: t('cloudySky.features.grouping.desc') },
  { icon: Smartphone, title: t('cloudySky.features.media.title'), desc: t('cloudySky.features.media.desc') },
  { icon: RefreshCw, title: t('cloudySky.features.reply.title'), desc: t('cloudySky.features.reply.desc') },
  { icon: Wifi, title: t('cloudySky.features.settings.title'), desc: t('cloudySky.features.settings.desc') },
])

const requirements = computed(() => [
  { title: t('cloudySky.requirements.android.title'), desc: t('cloudySky.requirements.android.desc') },
  { title: t('cloudySky.requirements.account.title'), desc: t('cloudySky.requirements.account.desc') },
  { title: t('cloudySky.requirements.battery.title'), desc: t('cloudySky.requirements.battery.desc') },
])

definePageMeta({
  title: 'CloudySky',
  description: 'Official Solar Network Android push notification companion app.',
})

useSeoMeta({
  description: () => t('cloudySky.tagline'),
})

defineOgImage('UniOgImage', {
  title: 'CloudySky',
  description: () => t('cloudySky.tagline'),
  iconImage: '/images/cloudy-sky/icon.png',
  backgroundImage: '/images/cloudy-sky/main-visual.svg',
})
</script>

<template>
  <ProductLanding
    :slug="PRODUCT_SLUG"
    title="CloudySky"
    :tagline="t('cloudySky.tagline')"
    icon="/images/cloudy-sky/icon.png"
    background="/images/cloudy-sky/main-visual.svg"
    :badges="['Android', t('cloudySky.openSource')]"
    prompt="sse://push.solian.app"
    :primary-label="t('releasePage.downloads')"
    :to="localePath(`/products/${PRODUCT_SLUG}/releases`)"
    :repo="REPO_URL"
    :about-title="t('cloudySky.about.title')"
    :about-desc="t('cloudySky.about.desc')"
    :about-cards="aboutCards"
    :features-title="t('cloudySky.features.title')"
    :features-desc="t('cloudySky.features.desc')"
    :features="features"
  >
    <template #after-features>
      <section class="band">
        <div class="shell">
          <h2 class="band-title">
            {{ t('cloudySky.requirements.title') }}
          </h2>
          <ul class="req-grid">
            <li v-for="item in requirements" :key="item.title" class="req">
              <CheckCircle class="req-icon" aria-hidden="true" />
              <div>
                <h3 class="req-title">{{ item.title }}</h3>
                <p class="req-desc">{{ item.desc }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </template>
  </ProductLanding>
</template>

<style scoped>
.band {
  padding-top: 3.5rem;
}

.band-title {
  margin: 0 0 1.25rem;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.req-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.req {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding-block: 1rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.req-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
  color: var(--color-success);
}

.req-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.req-desc {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

@media (min-width: 768px) {
  .req-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 2.5rem;
  }
}
</style>
