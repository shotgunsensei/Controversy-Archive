import { Router, type IRouter } from "express";
import {
  db,
  topicSuggestionsTable,
  topicsTable,
  type TopicSuggestion as DbTopicSuggestion,
  type Topic as DbTopic,
} from "@workspace/db";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { rateLimit } from "../middlewares/rateLimit";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

const suggestionRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message:
    "You've submitted too many suggestions recently. Please wait a few minutes before trying again.",
});

const DEFAULT_CATEGORY = "Unsorted";

function serializeSuggestion(s: DbTopicSuggestion) {
  return {
    id: s.id,
    title: s.title,
    controversy: s.controversy,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  };
}

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "topic";
  let candidate = base;
  let suffix = 2;
  // Loop until we find a slug not already used by a live topic.
  while (true) {
    const [existing] = await db
      .select({ id: topicsTable.id })
      .from(topicsTable)
      .where(eq(topicsTable.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function buildSummary(controversy: string): string {
  const trimmed = controversy.trim();
  if (trimmed.length <= 200) return trimmed;
  const truncated = trimmed.slice(0, 197);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated;
  return `${cut.replace(/[\s.,;:!?-]+$/, "")}…`;
}

router.get("/topic-suggestions", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(topicSuggestionsTable)
      .where(eq(topicSuggestionsTable.status, "pending"))
      .orderBy(desc(topicSuggestionsTable.createdAt));
    res.json(rows.map(serializeSuggestion));
  } catch (err) {
    logger.error({ err }, "Failed to list topic suggestions");
    res.status(500).json({ error: "Failed to list topic suggestions" });
  }
});

router.post("/topic-suggestions", suggestionRateLimit, async (req, res) => {
  try {
    const body = req.body as unknown;
    const title =
      body && typeof (body as Record<string, unknown>)["title"] === "string"
        ? ((body as Record<string, unknown>)["title"] as string).trim()
        : "";
    const controversy =
      body &&
      typeof (body as Record<string, unknown>)["controversy"] === "string"
        ? ((body as Record<string, unknown>)["controversy"] as string).trim()
        : "";

    if (title.length < 3 || title.length > 200) {
      res
        .status(400)
        .json({ error: "Title must be between 3 and 200 characters." });
      return;
    }
    if (controversy.length < 10 || controversy.length > 2000) {
      res.status(400).json({
        error: "Please explain the controversy in 10 to 2000 characters.",
      });
      return;
    }

    const [duplicate] = await db
      .select({ id: topicSuggestionsTable.id })
      .from(topicSuggestionsTable)
      .where(
        and(
          eq(sql`lower(${topicSuggestionsTable.title})`, title.toLowerCase()),
          ne(topicSuggestionsTable.status, "rejected"),
        ),
      )
      .limit(1);

    if (duplicate) {
      res.status(409).json({
        error: "That topic has already been suggested. Try a different title.",
      });
      return;
    }

    const [row] = await db
      .insert(topicSuggestionsTable)
      .values({ title, controversy })
      .returning();

    res.status(201).json(serializeSuggestion(row));
  } catch (err) {
    logger.error({ err }, "Failed to create topic suggestion");
    res.status(500).json({ error: "Failed to create topic suggestion" });
  }
});

function parseId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.post("/topic-suggestions/:id/approve", requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id == null) {
      res.status(404).json({ error: "Suggestion not found" });
      return;
    }

    const [suggestion] = await db
      .select()
      .from(topicSuggestionsTable)
      .where(eq(topicSuggestionsTable.id, id))
      .limit(1);

    if (!suggestion) {
      res.status(404).json({ error: "Suggestion not found" });
      return;
    }
    if (suggestion.status !== "pending") {
      res.status(409).json({
        error: `Suggestion has already been ${suggestion.status}.`,
      });
      return;
    }

    const slug = await generateUniqueSlug(suggestion.title);
    const [topic] = await db
      .insert(topicsTable)
      .values({
        slug,
        title: suggestion.title,
        category: DEFAULT_CATEGORY,
        summary: buildSummary(suggestion.controversy),
        controversy: suggestion.controversy,
      })
      .returning();

    await db
      .update(topicSuggestionsTable)
      .set({ status: "approved" })
      .where(eq(topicSuggestionsTable.id, id));

    res.json(serializeTopic(topic));
  } catch (err) {
    logger.error({ err }, "Failed to approve topic suggestion");
    res.status(500).json({ error: "Failed to approve topic suggestion" });
  }
});

router.post("/topic-suggestions/:id/reject", requireAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id == null) {
      res.status(404).json({ error: "Suggestion not found" });
      return;
    }

    const [suggestion] = await db
      .select()
      .from(topicSuggestionsTable)
      .where(eq(topicSuggestionsTable.id, id))
      .limit(1);

    if (!suggestion) {
      res.status(404).json({ error: "Suggestion not found" });
      return;
    }
    if (suggestion.status !== "pending") {
      res.status(409).json({
        error: `Suggestion has already been ${suggestion.status}.`,
      });
      return;
    }

    const [updated] = await db
      .update(topicSuggestionsTable)
      .set({ status: "rejected" })
      .where(eq(topicSuggestionsTable.id, id))
      .returning();

    res.json(serializeSuggestion(updated));
  } catch (err) {
    logger.error({ err }, "Failed to reject topic suggestion");
    res.status(500).json({ error: "Failed to reject topic suggestion" });
  }
});

export default router;
