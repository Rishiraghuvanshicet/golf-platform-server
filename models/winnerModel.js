import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  drawId: mongoose.Schema.Types.ObjectId,

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