import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    products: defineCollection({
      type: 'page',
      source: 'products/**',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
        background: z.string(),
        url: z.string().optional(),
        repo: z.string().optional(),
        version: z.string().optional(),
        releasedDate: z.string().optional(),
        hasPage: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
        series: z.string().optional(),
        distributionProductId: z.string().optional(),
      }),
    }),
    legal: defineCollection({
      type: 'page',
      source: 'legal/**',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        updatedDate: z.string().optional(),
      }),
    }),
    events: defineCollection({
      type: 'page',
      source: 'events/**',
      schema: z.object({
        name: z.string(),
        description: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        location: z.string().optional(),
        coverImage: z.string().optional(),
        status: z.enum(['upcoming', 'ongoing', 'past']),
        registrationUrl: z.string().optional(),
        tags: z.array(z.string()).default([]),
      }),
    }),
    contests: defineCollection({
      type: 'page',
      source: 'contests/**',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        shortDescription: z.string().optional(),
        coverImage: z.string().optional(),
        status: z.enum(['upcoming', 'ongoing', 'past']),
        rules: z.array(z.string()).default([]),
        prizes: z.array(z.object({
          place: z.string(),
          reward: z.string(),
        })).default([]),
        tags: z.array(z.string()).default([]),
      }),
    }),
  },
})
