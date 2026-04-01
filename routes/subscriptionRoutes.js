import express from "express";
import {
  createSubscription,
  cancelMySubscription,
  getMySubscription
} from "../controllers/subscriptionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSubscription);
router.get("/me", protect, getMySubscription);
router.post("/cancel", protect, cancelMySubscription);

export default router;

