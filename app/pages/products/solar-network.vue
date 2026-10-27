<script setup lang="ts">
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Code,
  CodeXml,
  CreditCard,
  ExternalLink,
  FileText,
  Folder,
  Globe,
  Heart,
  Image,
  MessageSquare,
  Monitor,
  Rss,
  Shield,
  SmilePlus,
  Sparkles,
  Sticker,
  Users,
  Wallet,
  Zap,
} from '@lucide/vue'

const { t, locale } = useI18n()

const PRODUCT_SLUG = 'solar-network'
const docsUrl = computed(() =>
  locale.value === 'zh'
    ? 'https://kb.solsynth.dev/zh/solar-network/account/'
    : 'https://kb.solsynth.dev/solar-network/account/',
)

const aboutCards = computed(() => [
  { icon: Heart, title: t('solarNetwork.aboutCard.peaceful.title'), desc: t('solarNetwork.aboutCard.peaceful.desc') },
  { icon: Code, title: t('solarNetwork.aboutCard.developer.title'), desc: t('solarNetwork.aboutCard.developer.desc') },
  { icon: Zap, title: t('solarNetwork.aboutCard.open.title'), desc: t('solarNetwork.aboutCard.open.desc') },
])

const featuredFeatures = [
  { key: 'timeline', icon: MessageSquare, image: '/images/solar-network/screenshots/explore.webp' },
  { key: 'chat', icon: MessageSquare, image: '/images/solar-network/screenshots/chat.webp' },
  { key: 'realms', icon: Users, image: '/images/solar-network/screenshots/realms.webp' },
] as const

const screenshotFeatures = [
  { key: 'reactions', icon: SmilePlus, image: '/images/solar-network/screenshots/post-reactions.webp' },
  { key: 'collections', icon: Folder, image: '/images/solar-network/screenshots/post-collections.webp' },
  { key: 'wallet', icon: Wallet, image: '/images/solar-network/screenshots/wallet.webp' },
  { key: 'stickers', icon: Sticker, image: '/images/solar-network/screenshots/stickers.webp' },
  { key: 'files', icon: Image, image: '/images/solar-network/screenshots/drive.webp' },
  { key: 'achievements', icon: CheckCircle, image: '/images/solar-network/screenshots/badges.webp' },
  { key: 'polls', icon: Calendar, image: '/images/solar-network/screenshots/surveys.webp' },
  { key: 'dashboard', icon: Monitor, image: '/images/solar-network/screenshots/dashboard.webp' },
  { key: 'events', icon: Calendar, image: '/images/solar-network/screenshots/events.webp' },
  { key: 'eventCalendar', icon: Calendar, image: '/images/solar-network/screenshots/event-calendar.webp' },
  { key: 'presences', icon: Sparkles, image: '/images/solar-network/screenshots/profile-presences.webp' },
  { key: 'developerHub', icon: Code, image: '/images/solar-network/screenshots/developer-hub.webp' },
] as const

const simpleFeatures = [
  { key: 'social', icon: Users },
  { key: 'countdown', icon: Calendar },
  { key: 'oauth', icon: Shield },
  { key: 'checkin', icon: Bell },
  { key: 'rss', icon: Rss },
  { key: 'editor', icon: FileText },
  { key: 'fediverse', icon: Globe },
  { key: 'gallery', icon: Image },
  { key: 'subscription', icon: CreditCard },
  { key: 'more', icon: Sparkles },
] as const

definePageMeta({
  title: 'Solar Network',
  description: 'The peaceful social network.',
})

useSeoMeta({
  description: () => t('solarNetwork.tagline'),
})

defineOgImage('UniOgImage', {
  title: 'Solar Network',
  description: () => t('solarNetwork.tagline'),
  iconImage: '/images/solar-network/icon.png',
  backgroundImage: '/images/solar-network/main-visual-og.png',
})
</script>

<template>
  <div>
    <header class="masthead">
      <div class="shell masthead-grid">
        <div class="masthead-copy">
          <div class="ident">
            <img
              src="/images/solar-network/icon.png"
              class="ident-mark"
              alt=""
              width="56"
              height="56"
              loading="eager"
              decoding="async"
            >
            <span class="ident-badges">{{ t('solarNetwork.about.badge') }}</span>
          </div>

          <h1 class="display masthead-title">
            Solar Network
          </h1>
          <p class="masthead-lede">
            {{ t('solarNetwork.tagline') }}
          </p>

          <div class="masthead-actions">
            <a href="https://web.solian.app" target="_blank" rel="noopener" class="btn btn-primary action">
              {{ t('solarNetwork.getStarted') }}
            </a>
            <a href="#download" class="btn btn-ghost action">
              {{ t('solarNetwork.download.btn') }}
            </a>
            <a :href="docsUrl" target="_blank" rel="noopener" class="masthead-link">
              <BookOpen class="link-icon" aria-hidden="true" />
              {{ t('solarNetwork.docs') }}
            </a>
            <a href="https://github.com/Solsynth/Solian" target="_blank" rel="noopener" class="masthead-link">
              <CodeXml class="link-icon" aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>

        <figure class="masthead-visual">
          <NuxtImg
            src="/images/solar-network/main-visual.webp"
            alt=""
            width="1600"
            height="1000"
            sizes="sm:100vw lg:46vw"
            format="webp"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            style="view-transition-name: product-hero-solar-network"
          />
        </figure>
      </div>
    </header>

    <section class="band">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ t('solarNetwork.about.title') }}
          </h2>
          <p class="band-lede">
            {{ t('solarNetwork.about.desc') }}
          </p>
        </div>

        <ul class="fact-grid">
          <li v-for="card in aboutCards" :key="card.title" class="fact-block">
            <component :is="card.icon" class="fact-icon" aria-hidden="true" />
            <h3 class="fact-title">
              {{ card.title }}
            </h3>
            <p class="fact-desc">
              {{ card.desc }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- The three headline surfaces, each shown at full size beside its
         explanation. This alternation is the page's one structural gesture. -->
    <section class="band">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ t('solarNetwork.features.title') }}
          </h2>
          <p class="band-lede">
            {{ t('solarNetwork.features.desc') }}
          </p>
        </div>

        <ol class="showcase">
          <li v-for="feature in featuredFeatures" :key="feature.key" class="showcase-row">
            <div class="showcase-copy">
              <h3 class="showcase-title">
                {{ t(`solarNetwork.features.${feature.key}.title`) }}
              </h3>
              <p class="showcase-desc">
                {{ t(`solarNetwork.features.${feature.key}.desc`) }}
              </p>
            </div>
            <figure class="showcase-art">
              <NuxtImg
                :src="feature.image"
                :alt="t(`solarNetwork.features.${feature.key}.title`)"
                width="1200"
                height="800"
                sizes="sm:100vw lg:50vw"
                loading="lazy"
                format="webp"
              />
            </figure>
          </li>
        </ol>
      </div>
    </section>

    <section class="band">
      <div class="shell">
        <h2 class="band-title">
          {{ t('solarNetwork.features.moreTitle') }}
        </h2>

        <ul class="gallery">
          <li v-for="feature in screenshotFeatures" :key="feature.key" class="gallery-item">
            <figure class="gallery-art">
              <NuxtImg
                :src="feature.image"
                :alt="t(`solarNetwork.features.${feature.key}.title`)"
                width="800"
                height="600"
                sizes="sm:100vw md:50vw lg:33vw"
                loading="lazy"
                format="webp"
              />
            </figure>
            <h3 class="gallery-title">
              {{ t(`solarNetwork.features.${feature.key}.title`) }}
            </h3>
            <p class="gallery-desc">
              {{ t(`solarNetwork.features.${feature.key}.desc`) }}
            </p>
          </li>
        </ul>

        <ul class="compact">
          <li v-for="feature in simpleFeatures" :key="feature.key" class="compact-item">
            <component :is="feature.icon" class="compact-icon" aria-hidden="true" />
            <div>
              <h3 class="compact-title">
                {{ t(`solarNetwork.features.${feature.key}.title`) }}
              </h3>
              <p class="compact-desc">
                {{ t(`solarNetwork.features.${feature.key}.desc`) }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <ProductDownloadsCta :slug="PRODUCT_SLUG" product-title="Solar Network" />
  </div>
</template>

<style scoped>
.masthead {
  padding-block: 2rem 2.5rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.masthead-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.25rem;
  align-items: center;
}

.masthead-copy {
  max-width: 34rem;
}

.ident {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.ident-mark {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-mark);
  object-fit: cover;
  background: var(--color-base-300);
}

.ident-badges {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-faint);
}

.masthead-title {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
}

.masthead-lede {
  margin: 1rem 0 0;
  max-width: 32rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.masthead-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  margin-top: 1.75rem;
}

.action {
  padding-inline: 1.25rem;
}

.masthead-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-faint);
  text-decoration: none;
  transition: color 140ms ease;
}

.masthead-link:hover,
.masthead-link:focus-visible {
  color: var(--color-base-content);
}

.link-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.masthead-visual {
  margin: 0;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-line-soft);
  background: var(--color-base-200);
}

.masthead-visual img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.band {
  padding-top: 3.5rem;
}

.band-head {
  max-width: 34rem;
  margin-bottom: 2rem;
}

.band-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.band-lede {
  margin: 0.6rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.fact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fact-block {
  padding-top: 1rem;
  border-top: 1px solid var(--color-line);
}

.fact-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  color: var(--color-primary);
}

.fact-title {
  margin: 0.7rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.fact-desc {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.showcase {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.showcase-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
}

.showcase-copy {
  max-width: 28rem;
}

.showcase-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.showcase-desc {
  margin: 0.6rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.showcase-art {
  margin: 0;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-line-soft);
  background: var(--color-base-200);
}

.showcase-art img {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
}

.gallery {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.75rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gallery-item {
  min-width: 0;
}

.gallery-art {
  margin: 0 0 0.75rem;
  overflow: hidden;
  border-radius: var(--radius-chip);
  border: 1px solid var(--color-line-soft);
  background: var(--color-base-200);
}

.gallery-art img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.gallery-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.gallery-desc {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.compact {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 3rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.compact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-block: 0.9rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.compact-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
  color: var(--color-primary);
}

.compact-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.compact-desc {
  margin: 0.15rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

@media (min-width: 640px) {
  .card-grid,
  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 2.5rem;
  }
}

@media (min-width: 1024px) {
  .masthead {
    padding-block: 2.75rem 3.25rem;
  }

  .masthead-grid {
    grid-template-columns: minmax(0, 32rem) minmax(0, 1fr);
    gap: 3.5rem;
  }

  .fact-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .showcase-row {
    grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    gap: 3rem;
  }

  .showcase-row:nth-child(even) .showcase-copy {
    order: 2;
  }

  .gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .compact {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
