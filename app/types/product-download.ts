import type { Component } from "vue"

export type ProductDownloadAction = {
  href?: string
  artifactPlatform?: string
  artifactArchitecture?: string
  label: string
  i18n?: boolean
  variant: "primary" | "outline" | "ghost"
  icon: Component
  iconClass?: string
}

export type ProductDownloadPlatform = {
  id: string
  label: string
  icon: Component
  iconClass?: string
  titleKey: string
  descKey: string
  brew?: boolean
  actions: ProductDownloadAction[]
}
