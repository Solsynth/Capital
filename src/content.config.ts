import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: "**/*.{json,md}", base: "./src/content/products" }),
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    description: z.string(),
    descriptionZh: z.string().optional(),
    icon: z.string(),
    background: z.string(),
    url: z.string().optional(),
    repo: z.string().optional(),
    version: z.string().optional(),
    releasedDate: z.string().optional(),
    hasPage: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.string().optional(),
  }),
});

export const collections = {
  products,
  legal,
};