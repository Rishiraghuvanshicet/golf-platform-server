import Donation from "../models/donationModel.js";
import Charity from "../models/charityModel.js";

export const createDonation = async (req, res) => {
  const { charityId, amount, note } = req.body;

  if (!charityId) return res.status(400).json({ msg: "charityId is required" });
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 1) {
    return res.status(400).json({ msg: "amount must be at least 1" });
  }

  const charity = await Charity.findById(charityId);
  if (!charity) return res.status(400).json({ msg: "Invalid charity" });

  const donation = await Donation.create({
    userId: req.user.id,
    charityId,
    amount: n,
    note,
    status: "completed",
  });

  res.json(donation);
};

export const listMyDonations = async (req, res) => {
  const rows = await Donation.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("charityId", "name image");
  res.json(rows);
};
