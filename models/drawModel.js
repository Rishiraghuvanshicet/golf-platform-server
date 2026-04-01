import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    numbers: [Number],
    /** false = simulation / draft until admin publishes (PRD §06) */
    published: { type: Boolean, default: true },
    /** random | algorithmic (score-frequency weighted) */
    drawMode: { type: String, enum: ["random", "algorithmic", "manual"], default: "random" },
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Winner" }],
    /** PRD §07 snapshot for audit and transparency */
    prizePoolMeta: {
      activeSubscriberCount: Number,
      contributionPerSubscriber: Number,
      basePool: Number,
      tier3Amount: Number,
      tier4Amount: Number,
      tier5AmountFromMonth: Number,
      rolloverApplied: Number,
      tier5AmountTotal: Number,
      rolloverCarriedForward: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Draw", drawSchema);
