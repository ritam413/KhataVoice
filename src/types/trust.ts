import { TrustBadgeTier } from './domain';

export interface TrustScoreFactors {
  /** Average repayment velocity in days (V) */
  avgRepaymentDays: number;
  /** Overdue debt ratio: overdue_balance / total_credit_extended (R, 0 to 1) */
  overdueRatio: number;
  /** Lifetime successful transaction count (F) */
  transactionCount: number;
  /** Number of unresolved disputes or defaults (D) */
  disputes?: number;
}

export interface TrustScoreResult {
  score: number;
  tier: TrustBadgeTier;
  maxCreditLimit: number;
  factors: {
    velocityScore: number;
    overdueScore: number;
    frequencyScore: number;
    disputePenalty: number;
  };
}

export interface UpiLinkParams {
  vpa: string;
  payeeName: string;
  amount: number;
  note?: string;
}
