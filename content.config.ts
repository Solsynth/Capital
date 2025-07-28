import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    products: defineCollection({
      type: "data",
      source: "products/**.json",
      schema: z.object({
        icon: z.string(),
        background: z.string().optional(),
        name: z.string().nonempty(),
        description: z.string().optional(),
        url: z.string(),
        repo: z.string().optional(),
        releasedDate: z.date().optional(),
        version: z.string().optional(),
        updatedDate: z.date().optional()
      }),
    }),
  },
});
