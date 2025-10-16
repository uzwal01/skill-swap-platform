import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { getMe } from "../../controllers/auth.controller";
import { updateMe } from "../../controllers/user.controller";

const router = Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe)

export default router;