import { pgTable, serial, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type TheoryData = {
  title: string;
  explanation: string;
  plausibility: string;
  evidence: string | null;
};

export type DeepDiveData = {
  research: string;
  theories: TheoryData[];
  verdict: string | null;
};

export const topicsTable = pgTable("topics", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  controversy: text("controversy").notNull(),
  tags: text("tags").array().notNull().default([]),
  era: text("era"),
  origin: text("origin"),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  deepDive: jsonb("deep_dive").$type<DeepDiveData>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTopicSchema = createInsertSchema(topicsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topicsTable.$inferSelect;
