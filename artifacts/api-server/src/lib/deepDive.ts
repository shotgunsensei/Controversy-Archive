import { openai } from "@workspace/integrations-openai-ai-server";
import type { DeepDiveData, Topic } from "@workspace/db";
import { logger } from "./logger";

const SYSTEM_PROMPT = `You are a sharp, even-handed research analyst writing for an archive of the internet's most controversial and debated topics. Your job is to give readers genuinely insightful context and a fair survey of the competing theories about a topic — taking fringe ideas seriously enough to explain them, while being honest about evidence and plausibility. Write with curiosity and rigor, never sensationalism. Do not invent fake citations or fabricated quotes.`;

type RawTheory = {
  title?: unknown;
  explanation?: unknown;
  plausibility?: unknown;
  evidence?: unknown;
};

type RawDeepDive = {
  research?: unknown;
  theories?: unknown;
  verdict?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(raw: RawDeepDive): DeepDiveData {
  const theories = Array.isArray(raw.theories)
    ? (raw.theories as RawTheory[])
        .map((t) => ({
          title: asString(t.title),
          explanation: asString(t.explanation),
          plausibility: asString(t.plausibility) || "Speculative",
          evidence: asString(t.evidence) || null,
        }))
        .filter((t) => t.title && t.explanation)
    : [];

  return {
    research: asString(raw.research),
    theories,
    verdict: asString(raw.verdict) || null,
  };
}

export async function generateDeepDive(topic: Topic): Promise<DeepDiveData> {
  const userPrompt = `Topic: "${topic.title}"
Category: ${topic.category}
${topic.era ? `Era / origin period: ${topic.era}\n` : ""}Summary: ${topic.summary}
Why it is controversial: ${topic.controversy}
Tags: ${topic.tags.join(", ")}

Produce a deep dive as a JSON object with exactly these fields:
- "research": a markdown-formatted research write-up (use ## headings, short paragraphs, and bullet lists where useful). Roughly 350-550 words. Cover the established facts, the key points of dispute, and why this topic captured public attention online.
- "theories": an array of 3 to 5 theory objects, each with:
    - "title": a concise name for the theory
    - "explanation": 2-4 sentences explaining the theory
    - "plausibility": one of "Mainstream", "Plausible", "Contested", "Fringe", or "Speculative"
    - "evidence": one sentence summarizing the main evidence or reasoning behind it (or null if none)
  Order theories from most to least plausible. Include at least one mainstream/expert view AND at least one popular fringe theory so the survey is balanced.
- "verdict": 2-3 sentences giving a balanced assessment of where the truth most likely lies, acknowledging remaining uncertainty.

Return ONLY the JSON object, no surrounding prose.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  let parsed: RawDeepDive;
  try {
    parsed = JSON.parse(content) as RawDeepDive;
  } catch (err) {
    logger.error({ err, slug: topic.slug }, "Failed to parse deep dive JSON");
    throw new Error("The deep dive could not be generated. Please try again.");
  }

  const deepDive = normalize(parsed);
  if (!deepDive.research || deepDive.theories.length === 0) {
    throw new Error("The deep dive came back incomplete. Please try again.");
  }
  return deepDive;
}
