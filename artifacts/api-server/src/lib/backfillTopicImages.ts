import { db, topicsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Idempotent data backfill: every topic image is a static asset named after the
 * topic's slug (`public/topics/<slug>.png`). Older seeds populated the database
 * without `image_url`, which makes the UI fall back to a "?" placeholder. This
 * fills in any missing/empty `image_url` from the slug. It only touches rows
 * that need it, so it is a no-op once the data is correct.
 */
export async function backfillTopicImages(): Promise<void> {
  try {
    const result = await db
      .update(topicsTable)
      .set({ imageUrl: sql`'topics/' || ${topicsTable.slug} || '.png'` })
      .where(sql`${topicsTable.imageUrl} IS NULL OR ${topicsTable.imageUrl} = ''`);
    const updated = result.rowCount ?? 0;
    if (updated > 0) {
      logger.info({ updated }, "Backfilled missing topic image URLs");
    }
  } catch (err) {
    logger.error({ err }, "Failed to backfill topic image URLs");
  }
}
