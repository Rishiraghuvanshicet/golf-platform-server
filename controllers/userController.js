import User from "../models/userModel.js";
import Charity from "../models/charityModel.js";

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("charityId", "name image featured category description events");
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json(user);
};

export const updateMe = async (req, res) => {
  const { name, charityId, charityPercentage } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;

  if (charityId !== undefined) {
    const charity = await Charity.findById(charityId);
    if (!charity) return res.status(400).json({ msg: "Invalid charity" });
    update.charityId = charity._id;
    update.charity = charity.name;
  }

  if (charityPercentage !== undefined) {
    const n = Number(charityPercentage);
    if (!Number.isFinite(n) || n < 10 || n > 100) {
      return res.status(400).json({ msg: "charityPercentage must be between 10 and 100" });
    }
    update.charityPercentage = n;
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
    select: "-password",
  }).populate("charityId", "name image featured category description events");
  res.json(user);
};
