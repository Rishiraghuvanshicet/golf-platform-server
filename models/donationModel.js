import mongoose from "mongoose";

/** Independent one-off donation — not tied to draws (PRD §08) */
const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", required: true },
    amount: { type: Number, required: true, min: 1 },
    note: String,
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
