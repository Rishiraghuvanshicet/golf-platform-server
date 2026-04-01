import express from "express";
import {
  addScore,
  deleteScore,
  getMyScores,
  updateScore
} from "../controllers/scoreController.js";
import { protect, checkSubscription } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, checkSubscription, getMyScores);
router.post("/", protect, checkSubscription, addScore);
router.put("/:scoreId", protect, checkSubscription, updateScore);
router.delete("/:scoreId", protect, checkSubscription, deleteScore);

export default router;