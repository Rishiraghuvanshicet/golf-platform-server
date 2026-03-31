const subscriptionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  plan: String,
  status: String,
  expiryDate: Date
});