import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title:     z.string(),
    author: z.string().default('Riverside Dym i Ogień'),
    date:      z.coerce.date(),
    excerpt:   z.string(),
    // Opcjonalne wersje dla Google: tytuł bez marki (do ~35 znaków), opis 120–155 znaków.
    seoTitle:       z.string().optional(),
    seoDescription: z.string().optional(),
    cover: z.object({
      public_id: z.string(),
      alt:       z.string().default(''),
    }),
    published: z.boolean().default(false),
    // Przypięty post zawsze otwiera listing /posts, niezależnie od daty.
    pinned:    z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title:     z.string(),
    updatedAt: z.coerce.date(),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title:       z.string(),
    category:    z.enum(['Lokal', 'Wnetrza', 'Tank', 'Chef', 'Dania']),
    media: z.array(
    z.object({
    file: z.string(),
    alt: z.string().optional(),
     })
    ),
    order: z.coerce.number().optional().default(0),
    published:   z.boolean().default(true),
  }),
});

const pricingTierSchema = z.object({
  persons:    z.number(),
  price:      z.number(),
  label:      z.string().optional(),
  setmoreUrl: z.string(),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    name:    z.string(),
    content: z.string(),
    rating: z.coerce.number().min(1).max(5).default(5),
    source:  z.string().optional(),
  }),
});


const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer:   z.string(),
    order:    z.number().default(0),
  }),
});

const menu = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/menu' }),
  schema: z.object({
    category:    z.string(),
    name:        z.string(),
    description: z.string().optional(),
    price:       z.string(),
    weight:      z.string().optional(),
    tags:        z.array(z.enum(['Pikantne', 'Wegetariańskie', 'Polecane'])).optional().default([]),
    image:       z.string().optional(),
    order:       z.coerce.number().optional().default(0),
    published:   z.boolean().default(true),
  }),
});

// Menu okazjonalne (Sylwester, oferta świąteczna…) — każde pod /menu/<nazwa-pliku>/,
// widoczne od publikacji do końca dnia showUntil, patrz utils/offers.ts.
const offerItemSchema = z.object({
  name:        z.string(),
  description: z.string().optional(),
});

const offerSectionSchema = z.object({
  title: z.string(),
  note:  z.string().optional(),
  items: z.array(offerItemSchema).default([]),
});

const offers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offers' }),
  schema: z.object({
    title:     z.string(),
    intro:     z.string().optional(),
    seoDescription: z.string().optional(),
    cover:     z.string().optional(),
    showUntil: z.coerce.date(),
    // Zestawy — jeden, gdy menu ma jedną cenę (Sylwester), kilka przy wariantach (Zestaw I/II/III).
    variants: z.array(z.object({
      name:      z.string().optional(),
      price:     z.string().optional(),
      priceNote: z.string().optional(),
      note:      z.string().optional(),
      sections:  z.array(offerSectionSchema).default([]),
    })).default([]),
    included:  z.string().optional(),
    footnote:  z.string().optional(),
    booking:   z.enum(['stolik', 'impreza']).default('stolik'),
    pdf:       z.string().optional(),
    order:     z.coerce.number().optional().default(0),
    published: z.boolean().default(false),
  }),
});

export const collections = {
  posts,
  pages,
  gallery,
  testimonials,
  faq,
  menu,
  offers,
};
