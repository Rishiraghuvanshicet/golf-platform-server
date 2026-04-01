import mongoose from "mongoose";
import Score from "../models/scoreModel.js";
import Draw from "../models/drawModel.js";
import Winner from "../models/winnerModel.js";
import Subscription from "../models/subscriptionModel.js";
import {
  getActiveSubscriberCount,
  getJackpotRollover,
  setJackpotRollover,
  computePoolBreakdown,
  splitTierPrize,
  nextRolloverAfterDraw,
} from "../services/prizePoolService.js";

const generateDrawNumbers = () => {
  const numbers = [];
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }
  return numbers;
};

/** PRD §06: algorithmic option — weighted by how often scores 1–45 appear among active subscribers. */
const generateAlgorithmicDrawNumbers = async () => {
  const activeSubs = await Subscription.find({
    status: "active",
    expiryDate: { $gte: new Date() },
  }).select("userId");
  const userIds = activeSubs.map((s) => s.userId).filter(Boolean);
  if (userIds.length === 0) return generateDrawNumbers();

  const scoreDocs = await Score.find({
    userId: { $in: userIds },
  });
  const freq = Object.fromEntries(
    Array.from({ length: 45 }, (_, i) => [i + 1, 0])
  );
  for (const doc of scoreDocs) {
    for (const s of doc.scores || []) {
      const v = Number(s.value);
      if (Number.isFinite(v) && v >= 1 && v <= 45) freq[v] += 1;
    }
  }

  const pickWeighted = (excluded) => {
    const pool = [];
    let total = 0;
    for (let n = 1; n <= 45; n++) {
      if (excluded.has(n)) continue;
      const w = freq[n] + 1;
      pool.push({ n, w });
      total += w;
    }
    if (total <= 0) return null;
    let r = Math.random() * total;
    for (const { n, w } of pool) {
      r -= w;
      if (r <= 0) return n;
    }
    return pool[pool.length - 1].n;
  };

  const numbers = [];
  const excluded = new Set();
  while (numbers.length < 5) {
    const n = pickWeighted(excluded);
    if (n == null) break;
    numbers.push(n);
    excluded.add(n);
  }
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!excluded.has(n)) {
      numbers.push(n);
      excluded.add(n);
    }
  }
  return numbers;
};

const normalizeProvidedNumbers = (numbers) => {
  if (!Array.isArray(numbers)) return null;
  if (numbers.length !== 5) return null;
  const normalized = numbers.map((n) => Number(n));
  if (normalized.some((n) => !Number.isFinite(n) || n < 1 || n > 45)) return null;
  const unique = new Set(normalized);
  if (unique.size !== 5) return null;
  return normalized;
};

const checkMatch = (scores, drawNumbers) => {
  return scores.filter((s) => drawNumbers.includes(s.value)).length;
};

const normalizeDrawMode = (raw) => {
  const m = String(raw || "").toLowerCase();
  return m === "algorithmic" ? "algorithmic" : "random";
};

export const runDraw = async (req, res) => {
  try {
    const provided = normalizeProvidedNumbers(req.body?.numbers);
    const mode = normalizeDrawMode(req.body?.mode);
    const simulate = Boolean(req.body?.simulate);
    const published = !simulate;

    let drawNumbers;
    if (provided) {
      drawNumbers = provided;
    } else if (mode === "algorithmic") {
      drawNumbers = await generateAlgorithmicDrawNumbers();
    } else {
      drawNumbers = generateDrawNumbers();
    }

    const rolloverBefore = await getJackpotRollover();
    const activeCount = await getActiveSubscriberCount();
    const breakdown = computePoolBreakdown(activeCount, rolloverBefore);

    const usersScores = await Score.find();
    const rawWinners = [];

    usersScores.forEach((user) => {
      const match = checkMatch(user.scores, drawNumbers);
      if (match >= 3) {
        rawWinners.push({
          userId: user.userId,
          match,
        });
      }
    });

    const by5 = rawWinners.filter((w) => w.match === 5);
    const by4 = rawWinners.filter((w) => w.match === 4);
    const by3 = rawWinners.filter((w) => w.match === 3);

    const tier5Amount = breakdown.tiers[5].amountTotal;
    const tier4Amount = breakdown.tiers[4].amount;
    const tier3Amount = breakdown.tiers[3].amount;

    const final5 = splitTierPrize(by5, tier5Amount);
    const final4 = splitTierPrize(by4, tier4Amount);
    const final3 = splitTierPrize(by3, tier3Amount);
    const finalWinners = [...final5, ...final4, ...final3];

    const rolloverAfter = nextRolloverAfterDraw(by5.length, tier5Amount);
    await setJackpotRollover(rolloverAfter);

    const draw = await Draw.create({
      numbers: drawNumbers,
      winners: [],
      published,
      drawMode: provided ? "manual" : mode,
      prizePoolMeta: {
        activeSubscriberCount: breakdown.activeSubscriberCount,
        contributionPerSubscriber: breakdown.contributionPerSubscriber,
        basePool: breakdown.basePool,
        tier3Amount,
        tier4Amount,
        tier5AmountFromMonth: breakdown.tiers[5].amountFromCurrentMonth,
        rolloverApplied: breakdown.tiers[5].rolloverApplied,
        tier5AmountTotal: tier5Amount,
        rolloverCarriedForward: rolloverAfter,
      },
    });

    const savedWinners = [];
    for (const w of finalWinners) {
      const saved = await Winner.create({
        userId: w.userId,
        drawId: draw._id,
        match: w.match,
        prize: Math.round(w.prize * 100) / 100,
      });
      savedWinners.push(saved);
    }

    draw.winners = savedWinners.map((w) => w._id);
    await draw.save();

    res.json({
      draw,
      winners: savedWinners,
      mode: provided ? "manual" : mode,
      simulate,
      published,
      prizePool: {
        ...breakdown,
        rolloverBefore,
        rolloverAfter,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const publicDrawFilter = () => ({
  $or: [{ published: true }, { published: { $exists: false } }],
});

export const getDrawResults = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? {} : publicDrawFilter();
    const draws = await Draw.find(filter).sort({ createdAt: -1 });
    res.json(draws);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const publishDraw = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid draw id" });
    }
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ msg: "Draw not found" });
    draw.published = true;
    await draw.save();
    res.json(draw);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getPrizePoolPreview = async (req, res) => {
  try {
    const rollover = await getJackpotRollover();
    const activeCount = await getActiveSubscriberCount();
    const breakdown = computePoolBreakdown(activeCount, rollover);
    res.json({
      jackpotRollover: rollover,
      ...breakdown,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
