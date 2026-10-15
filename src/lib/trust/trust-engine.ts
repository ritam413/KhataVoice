import { TrustBadgeTier } from '@/types/domain';
import { TrustScoreFactors, TrustScoreResult } from '@/types/trust';

/**
 * Calculates the Kirana Customer Credit Trust Score (0 - 100)
 * 
 * Formula:
 * Score = 40 * max(0, 1 - V / 30) + 30 * (1 - R) + 20 * min(1, F / 10) - 10 * D
 * 
 * Clamped strictly between 0 and 100.
 * Cold-Start Defense:
 * - Brand new customers (F < 2) receive provisional score of 70 ('SILVER')
 * - Pure cash customers with zero credit (V = 0, R = 0, F >= 2) receive 95 ('GOLD')
 */
export function calculateTrustScore(factors: TrustScoreFactors): TrustScoreResult {
  const {
    avgRepaymentDays,
    overdueRatio,
    transactionCount,
    disputes = 0,
  } = factors;

  // Cold-Start Defense: Brand new customers
  if (transactionCount < 2) {
    return {
      score: 70,
      tier: 'SILVER',
      maxCreditLimit: 1500,
      factors: {
        velocityScore: 28,
        overdueScore: 30,
        frequencyScore: 12,
        disputePenalty: 0,
      },
    };
  }

  // Pure cash customers with 0 credit history (never took udhaar)
  if (avgRepaymentDays === 0 && overdueRatio === 0 && transactionCount >= 2 && disputes === 0) {
    return {
      score: 95,
      tier: 'GOLD',
      maxCreditLimit: 5000,
      factors: {
        velocityScore: 40,
        overdueScore: 30,
        frequencyScore: 25,
        disputePenalty: 0,
      },
    };
  }

  // Component 1: Velocity Score (max 40 pts) - 30 days cutoff
  const clampedV = Math.max(0, avgRepaymentDays);
  const velocityScore = Math.max(0, 40 * (1 - clampedV / 30));

  // Component 2: Overdue Ratio Score (max 30 pts)
  const clampedR = Math.max(0, Math.min(1, overdueRatio));
  const overdueScore = 30 * (1 - clampedR);

  // Component 3: Frequency / History Score (max 20 pts) - 10 transactions reaches max
  const clampedF = Math.max(0, transactionCount);
  const frequencyScore = 20 * Math.min(1, clampedF / 10);

  // Component 4: Dispute Penalty (10 pts deduction per dispute)
  const disputePenalty = Math.max(0, disputes * 10);

  // Total raw score
  const rawScore = velocityScore + overdueScore + frequencyScore - disputePenalty;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // Tier mapping
  let tier: TrustBadgeTier = 'BRONZE';
  let maxCreditLimit = 0;

  if (score >= 85) {
    tier = 'GOLD';
    maxCreditLimit = 5000;
  } else if (score >= 65) {
    tier = 'SILVER';
    maxCreditLimit = 1500;
  } else {
    tier = 'BRONZE';
    maxCreditLimit = 0;
  }

  return {
    score,
    tier,
    maxCreditLimit,
    factors: {
      velocityScore: Math.round(velocityScore * 10) / 10,
      overdueScore: Math.round(overdueScore * 10) / 10,
      frequencyScore: Math.round(frequencyScore * 10) / 10,
      disputePenalty,
    },
  };
}

/**
 * Returns tier from a numeric score
 */
export function getTrustTier(score: number): TrustBadgeTier {
  if (score >= 85) return 'GOLD';
  if (score >= 65) return 'SILVER';
  return 'BRONZE';
}
