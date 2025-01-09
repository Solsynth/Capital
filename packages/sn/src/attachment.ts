import { sni } from './network'

export interface SnAttachment {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  rid: string
  uuid: string
  size: number
  name: string
  alt: string
  mimetype: string
  hash: string
  destination: number
  refCount: number
  contentRating: number
  qualityRating: number
  cleanedAt?: Date | null
  isAnalyzed: boolean
  isSelfRef: boolean
  isIndexable: boolean
  ref?: SnAttachment | null
  refId?: number | null
  poolId?: number | null
  accountId: number
  thumbnailId?: number | null
  thumbnail?: SnAttachment | null
  compressedId?: number | null
  compressed?: SnAttachment | null
  usermeta: Record<string, any>
  metadata: Record<string, any>
}

export async function getAttachment(id: string | number): Promise<SnAttachment> {
  const resp = await sni.get<SnAttachment>('/cgi/uc/attachments/' + id + '/meta')
  return resp.data
}

export async function listAttachment(id: string[]): Promise<SnAttachment[]> {
  const resp = await sni.get<{ data: SnAttachment[] }>('/cgi/uc/attachments', {
    params: {
      id: id.join(','),
      take: id.length,
    },
  })
  return resp.data.data
}
