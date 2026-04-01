import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw" },

  match: Number,
  prize: Number,

  proofImage: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Winner", winnerSchema);