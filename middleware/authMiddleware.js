import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ msg: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;

  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Not admin" });
  }
  next();
};

import Subscription from "../models/subscriptionModel.js";

export const checkSubscription = async (req, res, next) => {
  const sub = await Subscription.findOne({ userId: req.user.id });

  if (!sub || sub.status !== "active") {
    return res.status(403).json({ msg: "No active subscription" });
  }

  next();
};
