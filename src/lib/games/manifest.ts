import { z } from 'zod';

/** One item of the GamePix JSON feed (https://feeds.gamepix.com/v2/json?sid=...). */
export const GamePixFeedItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1),
  namespace: z.string().min(1),
  description: z.string().optional().default(''),
  category: z.string().optional().default('casual'),
  orientation: z.enum(['all', 'portrait', 'landscape']).optional().default('all'),
  quality_score: z.number().optional().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  date_published: z.string().optional(),
  banner_image: z.string().url().optional(),
  image: z.string().url().optional(),
  url: z.string().url().optional(),
});

export type GamePixFeedItem = z.infer<typeof GamePixFeedItemSchema>;
