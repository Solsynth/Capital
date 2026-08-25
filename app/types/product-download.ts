import type { Component } from "vue"

export type ProductDownloadBadge = {
  en: { light: string; dark: string }
  zh: { light: string; dark: string }
}

export type ProductDownloadAction = {
  href?: string
  artifactPlatform?: string
  artifactArchitecture?: string
  label: string
  i18n?: boolean
  variant: "primary" | "outline" | "ghost"
  icon: Component
  iconClass?: string
  badge?: ProductDownloadBadge
}

export type ProductDownloadPlatform = {
  id: string
  label: string
  icon: Component
  iconClass?: string
  titleKey: string
  descKey: string
  brew?: boolean
  noticeKey?: string
}
