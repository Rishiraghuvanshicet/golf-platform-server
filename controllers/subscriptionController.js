import Subscription from "../models/subscriptionModel.js";

export const createSubscription = async (req, res) => {
  const { plan } = req.body;

  if (!["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ msg: "plan must be monthly or yearly" });
  }

  const expiryDate =
    plan === "yearly"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const sub = await Subscription.findOneAndUpdate(
    { userId: req.user.id },
    { userId: req.user.id, plan, status: "active", expiryDate },
    { upsert: true, new: true }
  );

  res.json(sub);
};

export const getMySubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user.id }).sort({ expiryDate: -1 });
  res.json(sub);
};

export const cancelMySubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user.id }).sort({ expiryDate: -1 });
  if (!sub) return res.status(404).json({ msg: "Subscription not found" });

  sub.status = "cancelled";
  await sub.save();
  res.json(sub);
};