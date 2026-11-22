<script setup lang="ts">
import {
  BarChart3,
  Database,
  Download,
  FolderInput,
  Keyboard,
  Languages,
  Layers,
  LayoutGrid,
  Palette,
  Radio,
  Server,
  Shuffle,
  Sparkles,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const PRODUCT_SLUG = 'groovy-box'
const REPO_URL = 'https://src.solsynth.dev/Solsynth/GroovyBox'

const aboutCards = computed(() => [
  { icon: Server, title: t('groovyBox.aboutCard.sources.title'), desc: t('groovyBox.aboutCard.sources.desc') },
  { icon: Database, title: t('groovyBox.aboutCard.localFirst.title'), desc: t('groovyBox.aboutCard.localFirst.desc') },
  { icon: Sparkles, title: t('groovyBox.aboutCard.glacier.title'), desc: t('groovyBox.aboutCard.glacier.desc') },
])

const featureKeys = [
  { icon: Server, key: 'providers' },
  { icon: Database, key: 'catalog' },
  { icon: FolderInput, key: 'import' },
  { icon: Download, key: 'offline' },
  { icon: Languages, key: 'lyrics' },
  { icon: Palette, key: 'dynamicColor' },
  { icon: Shuffle, key: 'smartShuffle' },
  { icon: LayoutGrid, key: 'dashboard' },
  { icon: Radio, key: 'infinite' },
  { icon: Layers, key: 'preferred' },
  { icon: BarChart3, key: 'stats' },
  { icon: Keyboard, key: 'desktop' },
] as const

const features = computed(() =>
  featureKeys.map(({ icon, key }) => ({
    icon,
    title: t(`groovyBox.features.${key}.title`),
    desc: t(`groovyBox.features.${key}.desc`),
  })),
)

definePageMeta({
  title: 'GroovyBox',
  description:
    'A local-first Flutter music player for OpenSubsonic, Jellyfin, Apple Music, and imported audio.',
})

useSeoMeta({
  description: () => t('groovyBox.tagline'),
})

defineOgImage('UniOgImage', {
  title: 'GroovyBox',
  description: () => t('groovyBox.tagline'),
  iconImage: '/images/groovy-box/icon.png',
  backgroundImage: '/images/groovy-box/main-visual-og.png',
})
</script>

<template>
  <ProductLanding
    :slug="PRODUCT_SLUG"
    title="GroovyBox"
    :tagline="t('groovyBox.tagline')"
    icon="/images/groovy-box/icon.png"
    background="/images/groovy-box/main-visual.webp"
    :badges="[t('groovyBox.badgeOpenSubsonic'), t('groovyBox.badgeOffline'), t('groovyBox.badgeLyrics')]"
    prompt="groovybox --local-first"
    :primary-label="t('groovyBox.download.btn')"
    :to="localePath(`/products/${PRODUCT_SLUG}/releases`)"
    :repo="REPO_URL"
    :about-title="t('groovyBox.about.title')"
    :about-desc="t('groovyBox.about.desc')"
    :about-cards="aboutCards"
    :features-title="t('groovyBox.features.title')"
    :features-desc="t('groovyBox.features.desc')"
    :features="features"
  />
</template>
