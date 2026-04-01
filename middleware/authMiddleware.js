import jwt from "jsonwebtoken";
import Subscription from "../models/subscriptionModel.js";
import mongoose from "mongoose";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : authHeader.trim();

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Not admin" });
  }
  next();
};

export const checkSubscription = async (req, res, next) => {
  const sub = await Subscription.findOne({
  userId: new mongoose.Types.ObjectId(req.user.id)
});
  if (!sub || sub.status !== "active" || (sub.expiryDate && sub.expiryDate < new Date())) {
    return res.status(403).json({ msg: "No active subscription" });
  }

  next();
};
