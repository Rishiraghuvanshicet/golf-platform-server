import express from "express";
import {
  uploadProof,
  getMyWinnings,
  approveWinner
} from "../controllers/winnerController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload-proof", protect, uploadProof);
router.get("/my", protect, getMyWinnings);
router.put("/approve/:id", protect, isAdmin, approveWinner);

export default router;