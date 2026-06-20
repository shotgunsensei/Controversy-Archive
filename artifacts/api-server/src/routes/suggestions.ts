import { Router, type IRouter } from "express";
import {
  db,
  topicSuggestionsTable,
  type TopicSuggestion as DbTopicSuggestion,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function serializeSuggestion(s: DbTopicSuggestion) {
  return {
    id: s.id,
    title: s.title,
    controversy: s.controversy,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  };
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

router.post("/topic-suggestions", async (req, res) => {
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

export default router;
