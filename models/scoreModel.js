import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  scores: [
    {
      value: Number,
      date: Date
    }
  ]
});

export default mongoose.model("Score", scoreSchema);