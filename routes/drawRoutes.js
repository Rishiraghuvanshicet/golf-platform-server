import express from "express";
import {
  runDraw,
  getDrawResults
} from "../controllers/drawController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run", protect, isAdmin, runDraw);
router.get("/", protect, getDrawResults);

export default router;