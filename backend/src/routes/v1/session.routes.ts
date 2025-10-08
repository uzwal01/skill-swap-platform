import { Router } from "express";
import { createSession, getMySessions, updateSessionStatus } from "../../controllers/session.controller";
import { protect } from "../../middlewares/auth.middleware";


const router = Router();

router.post('/', protect, createSession);
router.get('/my', protect, getMySessions);
router.put('/:id/status', protect, updateSessionStatus);
// router.delete('/:id', protect, deleteSession);


export default router;