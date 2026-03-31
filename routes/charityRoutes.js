import express from "express";
import {
  getCharities,
  createCharity,
  deleteCharity
} from "../controllers/charityController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCharities);
router.post("/", protect, createCharity);
router.delete("/:id", protect, deleteCharity);

export default router;