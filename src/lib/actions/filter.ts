'use server';

import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function getAvailableSizes() {
  const sizes = await db
    .select({
      id: schema.sizes.id,
      name: schema.sizes.name,
      slug: schema.sizes.slug,
    })
    .from(schema.sizes)
    .orderBy(desc(schema.sizes.sortOrder));

  return sizes;
}
