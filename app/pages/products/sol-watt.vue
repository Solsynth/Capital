<script setup lang="ts">
import {
  AppWindow,
  Bell,
  Building2,
  Database,
  FileInput,
  GitBranch,
  HardDrive,
  Image,
  Kanban,
  Layers,
  LogIn,
  Mail,
  Monitor,
  RadioTower,
  Send,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const PRODUCT_SLUG = 'sol-watt'
const REPO_URL = 'https://src.solsynth.dev/SoSYS/SolWatt'

const aboutCards = computed(() => [
  { icon: AppWindow, title: t('solWatt.aboutCard.shell.title'), desc: t('solWatt.aboutCard.shell.desc') },
  { icon: Building2, title: t('solWatt.aboutCard.workspace.title'), desc: t('solWatt.aboutCard.workspace.desc') },
  { icon: RadioTower, title: t('solWatt.aboutCard.realtime.title'), desc: t('solWatt.aboutCard.realtime.desc') },
])

const featureKeys = [
  { icon: LogIn, key: 'signIn' },
  { icon: Layers, key: 'workspaces' },
  { icon: Mail, key: 'mail' },
  { icon: FileInput, key: 'mailImport' },
  { icon: Kanban, key: 'boards' },
  { icon: GitBranch, key: 'github' },
  { icon: HardDrive, key: 'drive' },
  { icon: Image, key: 'viewer' },
  { icon: Bell, key: 'notifications' },
  { icon: RadioTower, key: 'realtime' },
  { icon: Send, key: 'push' },
  { icon: Monitor, key: 'desktop' },
  { icon: Database, key: 'flywheel' },
] as const

const features = computed(() =>
  featureKeys.map(({ icon, key }) => ({
    icon,
    title: t(`solWatt.features.${key}.title`),
    desc: t(`solWatt.features.${key}.desc`),
  })),
)

definePageMeta({
  title: 'SolWatt',
  description:
    'The Solar Network workspace client — mail, boards and a team cloud drive in one desktop-first app.',
})

useSeoMeta({
  description: () => t('solWatt.tagline'),
})

defineOgImage('UniOgImage', {
  title: 'SolWatt',
  description: () => t('solWatt.tagline'),
  iconImage: '/images/sol-watt/icon.png',
  backgroundImage: '/images/sol-watt/main-visual.svg',
})
</script>

<template>
  <ProductLanding
    :slug="PRODUCT_SLUG"
    title="SolWatt"
    :tagline="t('solWatt.tagline')"
    icon="/images/sol-watt/icon.png"
    background="/images/sol-watt/main-visual.svg"
    :badges="[t('solWatt.badgeWorkspace'), t('solWatt.badgeDesktop'), t('solWatt.openSource')]"
    prompt="solwatt attach solar-network"
    :primary-label="t('solWatt.download.btn')"
    :to="localePath(`/products/${PRODUCT_SLUG}/releases`)"
    :repo="REPO_URL"
    :about-title="t('solWatt.about.title')"
    :about-desc="t('solWatt.about.desc')"
    :about-cards="aboutCards"
    :features-title="t('solWatt.features.title')"
    :features-desc="t('solWatt.features.desc')"
    :features="features"
  />
</template>
