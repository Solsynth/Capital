export interface ProductReleaseArtifact {
  id?: string
  platform?: string
  architecture?: string
  file_name?: string
  mime_type?: string
  size?: number
  hash?: string
  download_url?: string
  expired?: boolean
  uploaded_at?: string | null
  created_at?: string | null
}

export interface ProductRelease {
  id: string
  slug: string
  version: string
  createdAt: string | null
  releasedAt: string | null
  title: string | null
  changelog: string
  downloadUrl: string | null
  isPrerelease: boolean
  minimumVersion: string | null
  status: string
  artifactsExpired: boolean
  artifacts: ProductReleaseArtifact[]
}
