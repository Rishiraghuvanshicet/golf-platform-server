import User from "../models/userModel.js";
import Charity from "../models/charityModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, charityId, charityPercentage = 10 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "name, email, password are required" });
    }
    if (!charityId) {
      return res.status(400).json({ msg: "charityId is required — select a charity from the directory" });
    }

    const charity = await Charity.findById(charityId);
    if (!charity) return res.status(400).json({ msg: "Invalid charity" });

    const pct = Number(charityPercentage);
    if (!Number.isFinite(pct) || pct < 10 || pct > 100) {
      return res.status(400).json({ msg: "charityPercentage must be between 10 and 100" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      charityId: charity._id,
      charity: charity.name,
      charityPercentage: pct,
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      charityId: user.charityId,
      charity: user.charity,
      charityPercentage: user.charityPercentage,
    });
  } catch (err) {
    console.error("register", err);
    res.status(500).json({ msg: "Registration failed — check server logs" });
  }
};

export const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing — set it in Render / .env");
      return res.status(500).json({ msg: "Server misconfigured" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        charityId: user.charityId,
        charity: user.charity,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (err) {
    console.error("login", err);
    res.status(500).json({ msg: "Login failed — check database connection and server logs" });
  }
};
