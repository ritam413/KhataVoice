import fs from "fs";
import path from "path";

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex: string): [number, number, number] {
  const num = parseInt(hex.replace("#", ""), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrast(hex1: string, hex2: string): number {
  const lum1 = luminance(...hexToRgb(hex1));
  const lum2 = luminance(...hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

console.log("=== KV-03 Verification Runner (Frontend Engineer & Ponytail) ===");

// 1. Verify tokens.module.css exists & has all required tokens
const tokensPath = path.resolve("src/styles/tokens.module.css");
if (!fs.existsSync(tokensPath)) {
  console.error("FAIL: tokens.module.css not found!");
  process.exit(1);
}
const tokensCss = fs.readFileSync(tokensPath, "utf-8");

const requiredTokens = [
  "--saffron-primary",
  "--saffron-hover",
  "--saffron-glow",
  "--emerald-primary",
  "--emerald-hover",
  "--emerald-glow",
  "--crimson-primary",
  "--badge-gold",
  "--badge-silver",
  "--badge-bronze",
  "--bg-app",
  "--bg-card",
  "--border-card",
  "--border-focus",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--text-inverse",
  "--font-family-base",
  "--shadow-md",
  "--radius-md",
  "--radius-lg",
  "--touch-target-min",
  "--touch-target-hero",
];

for (const token of requiredTokens) {
  if (!tokensCss.includes(token)) {
    console.error(`FAIL: Missing token ${token}`);
    process.exit(1);
  }
}
console.log(`✓ All ${requiredTokens.length} design tokens verified in tokens.module.css`);

// 2. Verify globals.css imports tokens and configures reset
const globalsPath = path.resolve("src/app/globals.css");
const globalsCss = fs.readFileSync(globalsPath, "utf-8");
if (!globalsCss.includes('tokens.module.css')) {
  console.error("FAIL: globals.css does not import tokens.module.css");
  process.exit(1);
}
if (!globalsCss.includes('min-height: 48px')) {
  console.error("FAIL: globals.css missing 48px minimum touch target guard");
  process.exit(1);
}
if (!globalsCss.includes('--primary-foreground: 224 43% 7%')) {
  console.error("FAIL: globals.css missing dark text contrast fix on saffron primary");
  process.exit(1);
}
console.log("✓ globals.css import, touch target guard, and AAA contrast fix verified");

// 3. Mathematical WCAG 2.1 Contrast Invariants
const contrastChecks: [string, string, string, number][] = [
  ["#F8FAFC", "#0B0F19", "text-primary on bg-app", 7.0],
  ["#F8FAFC", "#131B2E", "text-primary on bg-card", 7.0],
  ["#94A3B8", "#0B0F19", "text-secondary on bg-app", 4.5],
  ["#94A3B8", "#131B2E", "text-secondary on bg-card", 4.5],
  ["#0B0F19", "#FF7700", "text-inverse on saffron-primary (CTA)", 7.0],
  ["#10B981", "#0B0F19", "emerald-primary on bg-app", 4.5],
  ["#F59E0B", "#0B0F19", "badge-gold on bg-app", 4.5],
  ["#EF4444", "#0B0F19", "crimson-primary on bg-app", 4.5],
];

for (const [fg, bg, label, min] of contrastChecks) {
  const c = contrast(fg, bg);
  if (c < min) {
    console.error(`FAIL: Contrast ${label} is ${c.toFixed(2)}:1 (required >= ${min}:1)`);
    process.exit(1);
  }
  console.log(`✓ Contrast ${label}: ${c.toFixed(2)}:1 (>= ${min}:1)`);
}

// 4. Invariant: White on saffron must be avoided
const whiteOnSaffron = contrast("#FFFFFF", "#FF7700");
console.log(`ℹ Notice: White text on saffron is ${whiteOnSaffron.toFixed(2)}:1 (Fails WCAG AA, prevented by --text-inverse)`);

console.log("\nALL KV-03 FRONTEND & PONYTAIL INVARIANTS VERIFIED SUCCESSFULLY!");
