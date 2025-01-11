export interface MaRelease {
  id: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  version: string
  type: number
  channel: string
  assets: Record<string, MaReleaseAsset>
  installers: Record<string, MaReleaseInstaller>
  product_id: number
  meta: MaReleaseMeta
}

export interface MaReleaseMeta {
  id: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  title: string
  description: string
  content: string
  attachments: string[]
  release_id: number
}

export interface MaReleaseAsset {
  uri: string
  contentType: string
}

export interface MaReleaseInstallerPatch {
  action: string
  glob: string
}

export interface MaReleaseInstaller {
  workdir?: string
  script?: string
  patches: MaReleaseInstallerPatch[]
}
