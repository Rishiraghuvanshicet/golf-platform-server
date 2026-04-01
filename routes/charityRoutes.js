import express from "express";
import {
  getCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
  featureCharity
} from "../controllers/charityController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCharities);
router.get("/:id", getCharityById);
router.post("/", protect, isAdmin, createCharity);
router.put("/:id/feature", protect, isAdmin, featureCharity);
router.put("/:id", protect, isAdmin, updateCharity);
router.delete("/:id", protect, isAdmin, deleteCharity);

export default router;