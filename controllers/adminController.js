import User from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";
import Charity from "../models/charityModel.js";
import Draw from "../models/drawModel.js";
import Winner from "../models/winnerModel.js";
import Donation from "../models/donationModel.js";
import { getJackpotRollover } from "../services/prizePoolService.js";

export const getSummary = async (req, res) => {
  const [
    users,
    activeSubs,
    charities,
    draws,
    drawsPublished,
    winnersPending,
    totalPrizePaid,
    totalPrizeOutstanding,
    jackpotRollover,
    donationAgg,
  ] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: "active", expiryDate: { $gte: new Date() } }),
    Charity.countDocuments(),
    Draw.countDocuments(),
    Draw.countDocuments({ $or: [{ published: true }, { published: { $exists: false } }] }),
    Winner.countDocuments({ status: "pending" }),
    Winner.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$prize" } } },
    ]),
    Winner.aggregate([
      { $match: { paymentStatus: "pending" } },
      { $group: { _id: null, total: { $sum: "$prize" } } },
    ]),
    getJackpotRollover(),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  res.json({
    users,
    activeSubs,
    charities,
    draws,
    drawsPublished,
    winnersPending,
    totalPrizePaid: totalPrizePaid[0]?.total || 0,
    totalPrizeOutstanding: totalPrizeOutstanding[0]?.total || 0,
    jackpotRollover,
    independentDonationsTotal: donationAgg[0]?.total || 0,
  });
};

export const listUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateUser = async (req, res) => {
  const { role, name, charityId, charityPercentage } = req.body;

  const update = {};
  if (role !== undefined) update.role = role;
  if (name !== undefined) update.name = name;
  if (charityId !== undefined) {
    const ch = await Charity.findById(charityId);
    if (!ch) return res.status(400).json({ msg: "Invalid charity" });
    update.charityId = ch._id;
    update.charity = ch.name;
  }
  if (charityPercentage !== undefined) {
    const n = Number(charityPercentage);
    if (!Number.isFinite(n) || n < 10 || n > 100) {
      return res.status(400).json({ msg: "charityPercentage must be between 10 and 100" });
    }
    update.charityPercentage = n;
  }

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
    select: "-password",
  });
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json(user);
};

export const listWinners = async (req, res) => {
  const winners = await Winner.find().sort({ createdAt: -1 });
  const userIds = [...new Set(winners.map((w) => String(w.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select("name email role");
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  res.json(
    winners.map((w) => ({
      ...w.toObject(),
      user: userMap.get(String(w.userId)) || null,
    }))
  );
};

export const listSubscriptions = async (req, res) => {
  const subs = await Subscription.find().sort({ expiryDate: -1 });
  const userIds = [...new Set(subs.map((s) => String(s.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select("name email");
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  res.json(
    subs.map((s) => ({
      ...s.toObject(),
      user: userMap.get(String(s.userId)) || null,
    }))
  );
};

export const updateSubscription = async (req, res) => {
  const { status, expiryDate } = req.body;
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return res.status(404).json({ msg: "Subscription not found" });

  if (status) sub.status = status;
  if (expiryDate) {
    const d = new Date(expiryDate);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ msg: "Invalid expiryDate" });
    sub.expiryDate = d;
  }

  await sub.save();
  res.json(sub);
};

