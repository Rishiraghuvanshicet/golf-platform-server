import Charity from "../models/charityModel.js";

export const getCharities = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = {};

    if (search && String(search).trim()) {
      const q = String(search).trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (category && String(category).trim() && category !== "all") {
      filter.category = String(category).trim();
    }
    if (featured === "true" || featured === "1") {
      filter.featured = true;
    }

    const charities = await Charity.find(filter).sort({ featured: -1, name: 1 });
    res.json(charities);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getCharityById = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ msg: "Charity not found" });
    res.json(charity);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const createCharity = async (req, res) => {
  const charity = await Charity.create(req.body);
  res.json(charity);
};

export const updateCharity = async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!charity) return res.status(404).json({ msg: "Charity not found" });
  res.json(charity);
};

export const deleteCharity = async (req, res) => {
  await Charity.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};

export const featureCharity = async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) return res.status(404).json({ msg: "Charity not found" });

  await Charity.updateMany({}, { featured: false });
  charity.featured = true;
  await charity.save();

  res.json(charity);
};
