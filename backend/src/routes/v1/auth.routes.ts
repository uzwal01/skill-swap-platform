import { Router } from "express";
import { loginUser, registerUser, getCurrentUser } from "../../controllers/auth.controller";


const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getCurrentUser);

export default router;