import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getSummary,
  listUsers,
  updateUser,
  listWinners,
  listSubscriptions,
  updateSubscription,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/summary", getSummary);
router.get("/users", listUsers);
router.put("/users/:id", updateUser);
router.get("/winners", listWinners);
router.get("/subscriptions", listSubscriptions);
router.put("/subscriptions/:id", updateSubscription);

export default router;

