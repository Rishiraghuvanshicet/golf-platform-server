import Charity from "../models/charityModel.js";

export const getCharities = async (req, res) => {
  const charities = await Charity.find();
  res.json(charities);
};

export const createCharity = async (req, res) => {
  const charity = await Charity.create(req.body);
  res.json(charity);
};

export const deleteCharity = async (req, res) => {
  await Charity.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};