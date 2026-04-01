/**
 * PRD §07 — Prize pool tier distribution (of monthly base pool from subscriptions).
 * 5-match tier also receives accumulated jackpot rollover when no 5-match winner previously.
 */
export const TIER_SHARE = {
  5: 0.4,
  4: 0.35,
  3: 0.25,
};

/** Env: currency units contributed per active subscriber into the monthly base pool (demo default). */
export function getContributionPerActiveSubscriber() {
  const n = Number(process.env.PRIZE_POOL_CONTRIBUTION_PER_SUB);
  return Number.isFinite(n) && n > 0 ? n : 100;
}
