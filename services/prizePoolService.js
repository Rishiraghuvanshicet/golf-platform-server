import Subscription from "../models/subscriptionModel.js";
import PrizePoolState from "../models/prizePoolStateModel.js";
import { TIER_SHARE, getContributionPerActiveSubscriber } from "../config/prizePool.js";

/**
 * Active subscribers: distinct users with an active, non-expired subscription.
 */
export async function getActiveSubscriberCount() {
  const now = new Date();
  const rows = await Subscription.aggregate([
    {
      $match: {
        status: "active",
        expiryDate: { $gte: now },
        userId: { $exists: true },
      },
    },
    { $group: { _id: "$userId" } },
    { $count: "count" },
  ]);
  return rows[0]?.count ?? 0;
}

export async function getJackpotRollover() {
  let doc = await PrizePoolState.findOne({ key: "global" });
  if (!doc) {
    doc = await PrizePoolState.create({ key: "global", jackpotRollover: 0 });
  }
  return doc.jackpotRollover;
}

export async function setJackpotRollover(amount) {
  await PrizePoolState.findOneAndUpdate(
    { key: "global" },
    { jackpotRollover: Math.max(0, amount) },
    { upsert: true, new: true }
  );
}

/**
 * Base monthly pool = activeSubscribers × contribution per sub.
 * Tier amounts: 3/4/5 from base; tier 5 also gets jackpot rollover from previous draws.
 */
export function computePoolBreakdown(activeCount, rolloverJackpot) {
  const perSub = getContributionPerActiveSubscriber();
  const basePool = activeCount * perSub;

  const tier3 = basePool * TIER_SHARE[3];
  const tier4 = basePool * TIER_SHARE[4];
  const tier5Base = basePool * TIER_SHARE[5];
  const tier5Total = tier5Base + (Number(rolloverJackpot) || 0);

  return {
    activeSubscriberCount: activeCount,
    contributionPerSubscriber: perSub,
    basePool,
    tiers: {
      3: { share: TIER_SHARE[3], amount: tier3 },
      4: { share: TIER_SHARE[4], amount: tier4 },
      5: {
        share: TIER_SHARE[5],
        amountFromCurrentMonth: tier5Base,
        rolloverApplied: Number(rolloverJackpot) || 0,
        amountTotal: tier5Total,
      },
    },
  };
}

/**
 * Split tier amount equally among winners; empty tier returns [].
 */
export function splitTierPrize(winnersForTier, tierAmount) {
  const n = winnersForTier.length;
  if (n === 0 || tierAmount <= 0) return [];
  const each = tierAmount / n;
  return winnersForTier.map((w) => ({
    ...w,
    prize: each,
  }));
}

/**
 * After draw: if no 5-match winners, entire tier-5 pool (including rollover) rolls to next month.
 */
export function nextRolloverAfterDraw(match5WinnerCount, tier5TotalAmount) {
  if (match5WinnerCount === 0) {
    return tier5TotalAmount;
  }
  return 0;
}
