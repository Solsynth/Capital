<script setup lang="ts">
import {
  AppWindow,
  Bot,
  Braces,
  Globe,
  Gauge,
  HandHeart,
  HeartPulse,
  Layers,
  Mic,
  Plug,
  ScrollText,
  ShieldCheck,
  Smile,
  Sparkles,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const PRODUCT_SLUG = 'persynth'
const REPO_URL = 'https://src.solsynth.dev/Solsynth/SynthPet'

const aboutCards = computed(() => [
  { icon: AppWindow, title: t('persynth.aboutCard.island.title'), desc: t('persynth.aboutCard.island.desc') },
  { icon: HeartPulse, title: t('persynth.aboutCard.localLife.title'), desc: t('persynth.aboutCard.localLife.desc') },
  { icon: Sparkles, title: t('persynth.aboutCard.core.title'), desc: t('persynth.aboutCard.core.desc') },
])

const features = computed(() => [
  { icon: Smile, title: t('persynth.features.face.title'), desc: t('persynth.features.face.desc') },
  { icon: HeartPulse, title: t('persynth.features.moods.title'), desc: t('persynth.features.moods.desc') },
  { icon: HandHeart, title: t('persynth.features.care.title'), desc: t('persynth.features.care.desc') },
  { icon: Bot, title: t('persynth.features.chat.title'), desc: t('persynth.features.chat.desc') },
  { icon: ScrollText, title: t('persynth.features.traces.title'), desc: t('persynth.features.traces.desc') },
  { icon: Mic, title: t('persynth.features.voice.title'), desc: t('persynth.features.voice.desc') },
  { icon: ShieldCheck, title: t('persynth.features.harness.title'), desc: t('persynth.features.harness.desc') },
  { icon: Plug, title: t('persynth.features.switches.title'), desc: t('persynth.features.switches.desc') },
  { icon: Layers, title: t('persynth.features.sets.title'), desc: t('persynth.features.sets.desc') },
  { icon: Braces, title: t('persynth.features.sandbox.title'), desc: t('persynth.features.sandbox.desc') },
  { icon: Globe, title: t('persynth.features.webtools.title'), desc: t('persynth.features.webtools.desc') },
  { icon: Gauge, title: t('persynth.features.bond.title'), desc: t('persynth.features.bond.desc') },
])

definePageMeta({
  title: 'Persynth',
  description:
    'A quiet island-style desktop pet companion with an ASCII face and a Personality Core.',
})

useSeoMeta({
  description: () => t('persynth.tagline'),
})

defineOgImage('UniOgImage', {
  title: 'Persynth',
  description: () => t('persynth.tagline'),
  iconImage: '/images/persynth/icon.png',
  backgroundImage: '/images/persynth/main-visual.svg',
})
</script>

<template>
  <ProductLanding
    :slug="PRODUCT_SLUG"
    title="Persynth"
    :tagline="t('persynth.tagline')"
    icon="/images/persynth/icon.png"
    background="/images/persynth/main-visual.svg"
    :badges="[t('persynth.badgeIsland'), t('persynth.badgeAscii'), t('persynth.badgePlugins')]"
    prompt="0.0 · mochi is here"
    :primary-label="t('persynth.download.btn')"
    :to="localePath(`/products/${PRODUCT_SLUG}/releases`)"
    :repo="REPO_URL"
    :about-title="t('persynth.about.title')"
    :about-desc="t('persynth.about.desc')"
    :about-cards="aboutCards"
    :features-title="t('persynth.features.title')"
    :features-desc="t('persynth.features.desc')"
    :features="features"
  />
</template>
