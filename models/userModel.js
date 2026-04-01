import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  /** PRD §08: linked charity from directory */
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity" },
  /** Denormalized name for quick display / legacy */
  charity: String,
  /** Minimum 10% of subscription fee; can be increased voluntarily */
  charityPercentage: { type: Number, default: 10, min: 10, max: 100 },
});

export default mongoose.model("User", userSchema);