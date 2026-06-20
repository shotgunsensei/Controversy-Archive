import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const topicSuggestionsTable = pgTable("topic_suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  controversy: text("controversy").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTopicSuggestionSchema = createInsertSchema(
  topicSuggestionsTable,
).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertTopicSuggestion = z.infer<typeof insertTopicSuggestionSchema>;
export type TopicSuggestion = typeof topicSuggestionsTable.$inferSelect;
