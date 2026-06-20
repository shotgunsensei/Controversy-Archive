import { Router, type IRouter } from "express";
import { db, topicsTable, type Topic as DbTopic } from "@workspace/db";
import { asc, eq, sql } from "drizzle-orm";
import { generateDeepDive } from "../lib/deepDive";
import type { DeepDiveData } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Deduplicate concurrent first-time deep-dive generations for the same slug so
// parallel requests share a single OpenAI call instead of each triggering one.
const inFlightDeepDives = new Map<string, Promise<DeepDiveData>>();

function serializeTopic(t: DbTopic) {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    category: t.category,
    summary: t.summary,
    controversy: t.controversy,
    tags: t.tags ?? [],
    era: t.era ?? null,
    origin: t.origin ?? null,
    imageUrl: t.imageUrl ?? null,
    featured: t.featured,
    hasDeepDive: t.deepDive != null,
  };
}

const SORTS = new Set(["title", "category", "recent"]);

router.get("/topics", async (req, res) => {
  try {
    const search =
      typeof req.query["search"] === "string"
        ? req.query["search"].trim().toLowerCase()
        : "";
    const category =
      typeof req.query["category"] === "string"
        ? req.query["category"].trim()
        : "";
    const sortParam =
      typeof req.query["sort"] === "string" ? req.query["sort"] : "title";
    const sort = SORTS.has(sortParam) ? sortParam : "title";

    let rows = await db.select().from(topicsTable);

    if (category) {
      rows = rows.filter(
        (r) => r.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (search) {
      rows = rows.filter((r) => {
        const haystack = [
          r.title,
          r.summary,
          r.controversy,
          r.category,
          (r.tags ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    rows.sort((a, b) => {
      if (sort === "category") {
        return (
          a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
        );
      }
      if (sort === "recent") {
        return b.id - a.id;
      }
      return a.title.localeCompare(b.title);
    });

    res.json(rows.map(serializeTopic));
  } catch (err) {
    logger.error({ err }, "Failed to list topics");
    res.status(500).json({ error: "Failed to list topics" });
  }
});

router.get("/topics/featured", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.featured, true))
      .orderBy(asc(topicsTable.title));
    res.json(rows.map(serializeTopic));
  } catch (err) {
    logger.error({ err }, "Failed to list featured topics");
    res.status(500).json({ error: "Failed to list featured topics" });
  }
});

router.get("/topics/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const [row] = await db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.slug, slug))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }
    res.json(serializeTopic(row));
  } catch (err) {
    logger.error({ err }, "Failed to get topic");
    res.status(500).json({ error: "Failed to get topic" });
  }
});

router.get("/topics/:slug/deep-dive", async (req, res) => {
  try {
    const slug = req.params.slug;
    const [row] = await db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.slug, slug))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }

    if (row.deepDive) {
      res.json({ slug: row.slug, ...row.deepDive });
      return;
    }

    let pending = inFlightDeepDives.get(row.slug);
    if (!pending) {
      pending = (async () => {
        const deepDive = await generateDeepDive(row);
        await db
          .update(topicsTable)
          .set({ deepDive })
          .where(eq(topicsTable.id, row.id));
        return deepDive;
      })().finally(() => {
        inFlightDeepDives.delete(row.slug);
      });
      inFlightDeepDives.set(row.slug, pending);
    }

    const deepDive = await pending;
    res.json({ slug: row.slug, ...deepDive });
  } catch (err) {
    logger.error({ err }, "Failed to generate deep dive");
    const message =
      err instanceof Error ? err.message : "Failed to generate deep dive";
    res.status(500).json({ error: message });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const rows = await db
      .select({
        category: topicsTable.category,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(topicsTable)
      .groupBy(topicsTable.category)
      .orderBy(asc(topicsTable.category));
    res.json(rows.map((r) => ({ category: r.category, count: r.count })));
  } catch (err) {
    logger.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const categories = await db
      .select({
        category: topicsTable.category,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(topicsTable)
      .groupBy(topicsTable.category)
      .orderBy(asc(topicsTable.category));

    const [totals] = await db
      .select({
        total: sql<number>`cast(count(*) as int)`,
        deepDives: sql<number>`cast(count(${topicsTable.deepDive}) as int)`,
      })
      .from(topicsTable);

    res.json({
      totalTopics: totals?.total ?? 0,
      totalCategories: categories.length,
      deepDivesGenerated: totals?.deepDives ?? 0,
      categories: categories.map((r) => ({
        category: r.category,
        count: r.count,
      })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
