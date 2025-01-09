export interface MaProduct {
  id: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  icon: string
  name: string
  alias: string
  description: string
  previews: string[]
  tags: string[]
  meta: MaProductMeta
  releases: null
  account_id: number
}

export interface MaProductMeta {
  id: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  introduction: string
  attachments: string[]
  product_id: number
}
