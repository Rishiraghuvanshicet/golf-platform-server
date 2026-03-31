import mongoose from "mongoose";

const drawSchema = new mongoose.Schema({
  numbers: [Number],
  winners: Array
}, { timestamps: true });

export default mongoose.model("Draw", drawSchema);