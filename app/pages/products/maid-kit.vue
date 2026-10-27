<script setup lang="ts">
import {
  Activity,
  Bot,
  Box,
  Cable,
  Container,
  Cpu,
  Database,
  FileCode2,
  FolderKanban,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  Network,
  Radio,
  Server,
  Settings2,
  Shield,
  SlidersHorizontal,
  Terminal,
  Wrench,
} from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()

const PRODUCT_SLUG = 'maid-kit'
const REPO_URL = 'https://github.com/Solsynth/MaidKit'

const aboutCards = computed(() => [
  { icon: Server, title: t('maidKit.aboutCard.ssh.title'), desc: t('maidKit.aboutCard.ssh.desc') },
  { icon: LayoutDashboard, title: t('maidKit.aboutCard.crossPlatform.title'), desc: t('maidKit.aboutCard.crossPlatform.desc') },
  { icon: KeyRound, title: t('maidKit.aboutCard.vault.title'), desc: t('maidKit.aboutCard.vault.desc') },
])

const featureKeys = [
  { icon: LayoutDashboard, key: 'dashboard' },
  { icon: Activity, key: 'activity' },
  { icon: Terminal, key: 'terminal' },
  { icon: FolderKanban, key: 'files' },
  { icon: Settings2, key: 'services' },
  { icon: Cpu, key: 'processes' },
  { icon: Server, key: 'webServers' },
  { icon: Wrench, key: 'ops' },
  { icon: Network, key: 'tunnels' },
  { icon: Database, key: 'databases' },
  { icon: Globe, key: 'tailscale' },
  { icon: Container, key: 'containers' },
  { icon: Box, key: 'projects' },
  { icon: FileCode2, key: 'snippets' },
  { icon: Radio, key: 'maidcafe' },
  { icon: Bot, key: 'agent' },
  { icon: GitBranch, key: 'github' },
  { icon: Cable, key: 'mcp' },
  { icon: Shield, key: 'security' },
  { icon: SlidersHorizontal, key: 'settings' },
] as const

const features = computed(() =>
  featureKeys.map(({ icon, key }) => ({
    icon,
    title: t(`maidKit.features.${key}.title`),
    desc: t(`maidKit.features.${key}.desc`),
  })),
)

definePageMeta({
  title: 'MaidKit',
  description: 'Cross-platform SSH server manager — non-intrusive maintenance over SSH.',
})

useSeoMeta({
  description: () => t('maidKit.tagline'),
})

defineOgImage('UniOgImage', {
  title: 'MaidKit',
  description: () => t('maidKit.tagline'),
  iconImage: '/images/maid-kit/icon.png',
  backgroundImage: '/images/maid-kit/main-visual-og.png',
})
</script>

<template>
  <ProductLanding
    :slug="PRODUCT_SLUG"
    title="MaidKit"
    :tagline="t('maidKit.tagline')"
    icon="/images/maid-kit/icon.png"
    background="/images/maid-kit/main-visual.webp"
    :badges="[t('maidKit.badgeSsh'), t('maidKit.badgeCrossPlatform'), t('maidKit.openSource')]"
    prompt="ssh keeper@your-server"
    :primary-label="t('maidKit.download.btn')"
    :to="localePath(`/products/${PRODUCT_SLUG}/releases`)"
    :repo="REPO_URL"
    :about-title="t('maidKit.about.title')"
    :about-desc="t('maidKit.about.desc')"
    :about-cards="aboutCards"
    :features-title="t('maidKit.features.title')"
    :features-desc="t('maidKit.features.desc')"
    :features="features"
  />
</template>
