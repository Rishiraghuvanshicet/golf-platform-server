import express from "express";
import {
  runDraw,
  getDrawResults,
  getPrizePoolPreview,
  publishDraw,
} from "../controllers/drawController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/pool-preview", getPrizePoolPreview);
router.post("/run", protect, isAdmin, runDraw);
router.post("/:id/publish", protect, isAdmin, publishDraw);
router.get("/", protect, getDrawResults);

export default router;