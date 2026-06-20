import { Router, type IRouter } from "express";
import healthRouter from "./health";
import topicsRouter from "./topics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(topicsRouter);

export default router;
