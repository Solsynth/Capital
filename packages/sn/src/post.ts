export interface SnPost {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  type: string
  body: SnPostBody & Record<string, any>
  language: string
  alias?: string | null
  aliasPrefix?: string | null
  tags: SnPostTag[]
  categories: SnPostCategory[]
  replies?: SnPost[] | null
  replyId?: number | null
  repostId?: number | null
  replyTo?: SnPost | null
  repostTo?: SnPost | null
  visibleUsersList?: number[] | null
  invisibleUsersList?: number[] | null
  visibility: number
  editedAt?: Date | null
  pinnedAt?: Date | null
  lockedAt?: Date | null
  isDraft: boolean
  publishedAt?: Date | null
  publishedUntil?: Date | null
  totalUpvote: number
  totalDownvote: number
  publisherId: number
  publisher: SnPublisher
  metric: SnMetric
}

export interface SnPostTag {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  alias: string
  name: string
  description: string
  posts?: SnPost[]
}

export interface SnPostCategory {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  alias: string
  name: string
  description: string
  posts?: SnPost[]
}

export interface SnPostBody {
  attachments: string[]
  content: string
  location?: string
  thumbnail?: string
  title?: string
}

export interface SnMetric {
  replyCount: number
  reactionCount: number
  reactionList: Record<string, number>
}

export interface SnPublisher {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  type: number
  name: string
  nick: string
  description: string
  avatar: string
  banner: string
  totalUpvote: number
  totalDownvote: number
  realmId?: number | null
  accountId: number
}
