import Winner from "../models/winnerModel.js";

export const uploadProof = async (req, res) => {
  const { winnerId, proofImage } = req.body;

  if (!winnerId || !proofImage) {
    return res.status(400).json({
      msg: "winnerId and proofImage are required — upload a screenshot or link to your Stableford scores from this platform",
    });
  }

  const winner = await Winner.findOne({ _id: winnerId, userId: req.user.id });
  if (!winner) return res.status(404).json({ msg: "Winner not found" });

  winner.proofImage = proofImage;
  winner.status = "pending";
  winner.paymentStatus = "pending";
  await winner.save();

  res.json(winner);
};

export const getMyWinnings = async (req, res) => {
  const winnings = await Winner.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("drawId", "numbers published createdAt prizePoolMeta drawMode");

  const rows = winnings.filter((w) => {
    const d = w.drawId;
    if (!d) return true;
    if (typeof d === "object" && d.published === false) return false;
    return true;
  });

  res.json(
    rows.map((w) => {
      const o = w.toObject();
      if (o.drawId && typeof o.drawId === "object" && o.drawId._id) {
        o.draw = o.drawId;
        o.drawId = o.drawId._id;
      }
      return o;
    })
  );
};

export const approveWinner = async (req, res) => {
  const { status, paymentStatus } = req.body;
  const winner = await Winner.findById(req.params.id);
  if (!winner) return res.status(404).json({ msg: "Winner not found" });

  if (status !== undefined) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    winner.status = status;
    if (status === "rejected") {
      winner.paymentStatus = "pending";
    }
  }
  if (paymentStatus !== undefined) {
    if (!["pending", "paid"].includes(paymentStatus)) {
      return res.status(400).json({ msg: "Invalid paymentStatus" });
    }
    if (paymentStatus === "paid" && winner.status !== "approved") {
      return res.status(400).json({ msg: "Can only mark paid after approval" });
    }
    winner.paymentStatus = paymentStatus;
  }

  await winner.save();
  res.json(winner);
};