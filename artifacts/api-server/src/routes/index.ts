import { Router, type IRouter } from "express";
import healthRouter from "./health";
import topicsRouter from "./topics";
import suggestionsRouter from "./suggestions";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(topicsRouter);
router.use(suggestionsRouter);
router.use(adminRouter);

export default router;
