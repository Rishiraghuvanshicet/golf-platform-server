import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createDonation, listMyDonations } from "../controllers/donationController.js";

const router = express.Router();

router.post("/", protect, createDonation);
router.get("/my", protect, listMyDonations);

export default router;
