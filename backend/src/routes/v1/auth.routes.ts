import { Router } from "express";
import { loginUser, registerUser, getCurrentUser } from "../../controllers/auth.controller";
import { protect } from "../../middlewares/auth.middleware";


const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// Protect current user route to prevent 401 due to missing token handling
router.get('/me', protect, getCurrentUser);

export default router;
