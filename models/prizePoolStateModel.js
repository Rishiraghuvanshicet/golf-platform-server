import mongoose from "mongoose";

/**
 * Singleton-style state: jackpot rollover for 5-match tier (PRD: carries forward if unclaimed).
 */
const prizePoolStateSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    jackpotRollover: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("PrizePoolState", prizePoolStateSchema);
