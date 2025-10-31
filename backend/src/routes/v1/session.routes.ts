import { Router } from "express";
import { createSession, getMySessions, updateSessionStatus, canMessageWithUser } from "../../controllers/session.controller";
import { protect } from "../../middlewares/auth.middleware";


const router = Router();

router.post('/', protect, createSession);
router.get('/my', protect, getMySessions);
router.put('/:id/status', protect, updateSessionStatus);
router.get('/with/:userId/can-message', protect, canMessageWithUser);
// router.delete('/:id', protect, deleteSession);


export default router;
