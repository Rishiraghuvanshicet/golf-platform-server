import express from "express";
import { addScore } from "../controllers/scoreController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkSubscription } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, checkSubscription, addScore);

export default router;