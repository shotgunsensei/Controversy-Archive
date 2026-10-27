import { Router, type IRouter } from "express";
import { db, topicsTable, type Topic as DbTopic } from "@workspace/db";
import { asc, eq, sql } from "drizzle-orm";
import type { DeepDiveData } from "@workspace/db";
import { logger } from "../lib/logger";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

// Same-process requests share a promise. A PostgreSQL topic-row lock below also
// prevents concurrent preparation across application instances.
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

    // Public reads never initialize a provider, incur generation cost or write
    // a dossier. Preparation belongs to the separately gated editor action.
    res.status(404).json({ error: "This dossier has not been prepared for publication.", code: "ARCHIVE_DEEP_DIVE_NOT_PREPARED" });
  } catch (err) {
    logger.error({ err }, "Failed to load prepared deep dive");
    res.status(500).json({ error: "The prepared dossier could not be loaded." });
  }
});

router.post("/topics/:slug/deep-dive", (_req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
}, requireAdmin, async (req, res) => {
  if (process.env.ARCHIVE_EDITOR_GENERATION !== "enabled") {
    res.status(503).json({ error: "Dossier preparation is not enabled.", code: "ARCHIVE_EDITOR_GENERATION_DISABLED" });
    return;
  }
  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || !process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    res.status(503).json({ error: "The dossier preparation provider is not configured.", code: "ARCHIVE_EDITOR_GENERATION_UNCONFIGURED" });
    return;
  }
  try {
    const slug = req.params.slug;
    if (typeof slug !== "string") { res.status(400).json({ error: "A topic slug is required." }); return; }
    const [row] = await db.select().from(topicsTable).where(eq(topicsTable.slug, slug)).limit(1);
    if (!row) { res.status(404).json({ error: "Topic not found" }); return; }
    if (row.deepDive) { res.json({ slug: row.slug, ...row.deepDive }); return; }

    let pending = inFlightDeepDives.get(row.slug);
    if (!pending) {
      pending = db.transaction(async tx => {
        // NOWAIT avoids holding a second connection while another instance is
        // preparing this topic. Recheck the cache only after owning its row.
        const [current] = await tx.select().from(topicsTable)
          .where(eq(topicsTable.id, row.id)).for("update", { noWait: true }).limit(1);
        if (!current) throw Object.assign(new Error("Topic not found"), { code: "ARCHIVE_TOPIC_REMOVED" });
        if (current.deepDive) return current.deepDive;
        const { generateDeepDive } = await import("../lib/deepDive");
        const deepDive = await generateDeepDive(current);
        await tx
          .update(topicsTable)
          .set({ deepDive })
          .where(eq(topicsTable.id, current.id));
        return deepDive;
      }).finally(() => {
        inFlightDeepDives.delete(row.slug);
      });
      inFlightDeepDives.set(row.slug, pending);
    }

    const deepDive = await pending;
    res.json({ slug: row.slug, ...deepDive });
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    const causeCode = (err as { cause?: { code?: string } } | null)?.cause?.code;
    if (code === "55P03" || causeCode === "55P03") {
      res.status(409).json({ error: "This dossier is already being prepared. Retry after it completes.", code: "ARCHIVE_DEEP_DIVE_PREPARING" });
      return;
    }
    if (code === "ARCHIVE_TOPIC_REMOVED") { res.status(404).json({ error: "Topic not found" }); return; }
    logger.error({ err }, "Failed to generate deep dive");
    res.status(500).json({ error: "Dossier preparation failed. Try again later." });
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
