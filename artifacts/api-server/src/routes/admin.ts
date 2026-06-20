import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.post("/admin/verify", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

export default router;
