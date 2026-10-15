import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ShieldCheck, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrustTier = "GOLD" | "SILVER" | "BRONZE";

export function getTrustTier(score: number): TrustTier {
  if (score >= 85) return "GOLD";
  if (score >= 65) return "SILVER";
  return "BRONZE";
}

const trustBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full border transition-all select-none",
  {
    variants: {
      tier: {
        GOLD: "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10",
        SILVER: "border-slate-400/40 bg-slate-500/15 text-slate-300",
        BRONZE: "border-red-500/40 bg-red-500/15 text-red-300 shadow-sm shadow-red-500/10",
      },
      size: {
        sm: "px-2 py-0.5 text-xs [&_svg]:size-3",
        md: "px-2.5 py-1 text-xs [&_svg]:size-3.5",
        lg: "px-3.5 py-1.5 text-sm [&_svg]:size-4 font-semibold",
      },
    },
    defaultVariants: {
      tier: "SILVER",
      size: "md",
    },
  }
);

const TIER_LABELS: Record<TrustTier, { en: string; bn: string; hi: string }> = {
  GOLD: {
    en: "GOLD",
    bn: "গোল্ড",
    hi: "उत्तम",
  },
  SILVER: {
    en: "SILVER",
    bn: "সিলভার",
    hi: "मध्यम",
  },
  BRONZE: {
    en: "AT RISK",
    bn: "সতর্ক",
    hi: "जोखिम",
  },
};

export interface TrustBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trustBadgeVariants> {
  score: number;
  showScore?: boolean;
  showLabel?: boolean;
  language?: "en" | "bn" | "hi";
}

export function TrustBadge({
  score,
  showScore = true,
  showLabel = true,
  language = "en",
  size = "md",
  className,
  ...props
}: TrustBadgeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
  const tier = getTrustTier(clampedScore);
  const labels = TIER_LABELS[tier];
  const localizedLabel = labels[language] || labels.en;

  const Icon =
    tier === "GOLD" ? ShieldCheck : tier === "SILVER" ? Shield : AlertTriangle;

  return (
    <div
      className={cn(trustBadgeVariants({ tier, size }), className)}
      aria-label={`Kirana Credit Trust Score: ${clampedScore} out of 100 (${localizedLabel})`}
      role="status"
      {...props}
    >
      <Icon className="shrink-0" aria-hidden="true" />
      {showScore && (
        <span className="font-semibold tabular-nums tracking-tight">
          {clampedScore}
        </span>
      )}
      {showScore && showLabel && (
        <span className="opacity-40 font-light" aria-hidden="true">
          •
        </span>
      )}
      {showLabel && (
        <span className="tracking-wide uppercase font-semibold">
          {localizedLabel}
        </span>
      )}
    </div>
  );
}

export { trustBadgeVariants };
