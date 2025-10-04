import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { getMe } from "../../controllers/auth.controller";

const router = Router();

router.get('/me', protect, getMe);

export default router;