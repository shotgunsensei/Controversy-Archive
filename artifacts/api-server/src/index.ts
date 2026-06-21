import app from "./app";
import { logger } from "./lib/logger";
import { backfillTopicImages } from "./lib/backfillTopicImages";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  // Repair any missing topic image URLs before accepting traffic so the first
  // requests on a cold start never serve placeholder images.
  await backfillTopicImages();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void start();
