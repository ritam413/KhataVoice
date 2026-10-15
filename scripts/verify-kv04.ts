import fs from "fs";
import path from "path";
import { getTrustTier } from "../src/components/ui/trust-badge";
import { buttonVariants } from "../src/components/ui/button";

console.log("=================================================");
console.log(" KV-04 AUTOMATED REGRESSION VERIFICATION HARNESS ");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`[PASS] ${label}`);
    passed++;
  } else {
    console.error(`[FAIL] ${label}`);
    failed++;
  }
}

// 1. File Existence Invariants
const REQUIRED_FILES = [
  "src/components/ui/button.tsx",
  "src/components/ui/badge.tsx",
  "src/components/ui/trust-badge.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/dialog.tsx",
  "src/components/ui/progress.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/sonner.tsx",
];

for (const file of REQUIRED_FILES) {
  const fullPath = path.join(process.cwd(), file);
  assert(fs.existsSync(fullPath), `File exists: ${file}`);
}

// 2. TrustBadge Deterministic Logic Invariants
assert(getTrustTier(100) === "GOLD", "getTrustTier(100) => GOLD");
assert(getTrustTier(85) === "GOLD", "getTrustTier(85) => GOLD (boundary test)");
assert(getTrustTier(84) === "SILVER", "getTrustTier(84) => SILVER (boundary test)");
assert(getTrustTier(75) === "SILVER", "getTrustTier(75) => SILVER");
assert(getTrustTier(65) === "SILVER", "getTrustTier(65) => SILVER (boundary test)");
assert(getTrustTier(64) === "BRONZE", "getTrustTier(64) => BRONZE (boundary test)");
assert(getTrustTier(30) === "BRONZE", "getTrustTier(30) => BRONZE");
assert(getTrustTier(0) === "BRONZE", "getTrustTier(0) => BRONZE");

// 3. Button Touch Target & Contrast Invariants
const defaultButtonClasses = buttonVariants({ variant: "default", size: "default" });
assert(
  defaultButtonClasses.includes("min-h-[48px]"),
  "Button size 'default' enforces min-h-[48px] Kirana touch target boundary"
);
assert(
  defaultButtonClasses.includes("text-primary-foreground"),
  "Button variant 'default' (Saffron) uses text-primary-foreground for 7.20:1 AAA contrast"
);

const voiceHeroClasses = buttonVariants({ variant: "default", size: "voiceHero" });
assert(
  voiceHeroClasses.includes("min-h-[80px]") && voiceHeroClasses.includes("rounded-full"),
  "Button size 'voiceHero' provides oversized circular mic action (80px)"
);

// 4. Input Touch Target Invariant
const inputSource = fs.readFileSync(path.join(process.cwd(), "src/components/ui/input.tsx"), "utf8");
assert(
  inputSource.includes("min-h-[48px]") || inputSource.includes("h-12"),
  "Input component enforces minimum 48px touch boundary"
);

// 5. Layout Toaster Integration Invariant
const layoutSource = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
assert(
  layoutSource.includes("<Toaster") && layoutSource.includes("@/components/ui/sonner"),
  "Root layout integrates <Toaster /> from @/components/ui/sonner"
);

// 6. Dialog Client Component Invariant
const dialogSource = fs.readFileSync(path.join(process.cwd(), "src/components/ui/dialog.tsx"), "utf8");
assert(
  dialogSource.startsWith('"use client"') || dialogSource.startsWith("'use client'"),
  "Dialog component declares 'use client' for Next.js App Router safety"
);

// 7. Progress Client Component Invariant
const progressSource = fs.readFileSync(path.join(process.cwd(), "src/components/ui/progress.tsx"), "utf8");
assert(
  progressSource.startsWith('"use client"') || progressSource.startsWith("'use client'"),
  "Progress component declares 'use client' for Next.js App Router safety"
);

console.log("\n-------------------------------------------------");
console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
console.log("-------------------------------------------------");

if (failed > 0) {
  process.exit(1);
}
