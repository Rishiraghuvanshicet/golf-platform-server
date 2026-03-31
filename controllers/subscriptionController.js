import Subscription from "../models/subscriptionModel.js";

export const createSubscription = async (req, res) => {
  const { plan } = req.body;

  const expiryDate =
    plan === "yearly"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const sub = await Subscription.create({
    userId: req.user.id,
    plan,
    status: "active",
    expiryDate
  });

  res.json(sub);
};

export const getMySubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user.id });
  res.json(sub);
};