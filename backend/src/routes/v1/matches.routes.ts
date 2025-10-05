import { Router } from "express";
import { getMatches } from "../../controllers/match.controller";
import { protect } from "../../middlewares/auth.middleware";


const router = Router();


router.get('/', protect, getMatches);           // GET /api/v1/matches


export default router;