import type { Request, Response, NextFunction } from "express";

const ADMIN_KEY_HEADER = "x-admin-key";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env["ADMIN_KEY"];
  if (!expected) {
    res.status(503).json({
      error:
        "Admin moderation is not configured. Set the ADMIN_KEY secret to enable it.",
    });
    return;
  }

  const provided = req.header(ADMIN_KEY_HEADER);
  if (!provided || provided !== expected) {
    res.status(401).json({ error: "Invalid or missing admin key." });
    return;
  }

  next();
}
