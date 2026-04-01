import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date },
    description: String,
    /** e.g. "golf_day", "fundraiser" */
    type: { type: String, default: "event" },
  },
  { _id: true }
);

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  featured: { type: Boolean, default: false },
  /** Filter / taxonomy for directory (e.g. education, health, youth) */
  category: { type: String, default: "general" },
  events: [eventSchema],
});

export default mongoose.model("Charity", charitySchema);
