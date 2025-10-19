import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { getMe } from "../../controllers/auth.controller";
import { getFeaturedUsers, searchUsers, updateMe } from "../../controllers/user.controller";

const router = Router();

router.get('/featured', getFeaturedUsers);
router.get('/', searchUsers);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe)

export default router;