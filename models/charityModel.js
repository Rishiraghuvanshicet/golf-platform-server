import mongoose from "mongoose";

const charitySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String
});

export default mongoose.model("Charity", charitySchema);