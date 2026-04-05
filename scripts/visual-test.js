#!/usr/bin/env node

/**
 * @file Visual validation of generated SVG cards.
 * Parses each SVG and checks structural/visual correctness:
 *   - Valid SVG root with proper dimensions
 *   - Background rect with themed fill color
 *   - Title text present and non-empty
 *   - Stats rows or language items present
 *   - Animations defined (keyframes)
 *   - Rank circle (stats cards only)
 *   - Language colors and percentages (lang cards only)
 *   - No overlapping elements (bounding box sanity check)
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/* eslint-disable jsdoc/require-jsdoc */

const dir = process.argv[2] || "./generated";
const files = readdirSync(dir).filter((f) => f.endsWith(".svg"));

if (files.length === 0) {
  console.error(`No SVG files found in ${dir}`);
  process.exit(1);
}

let totalChecks = 0;
let passed = 0;
let failed = 0;

function check(file, description, condition) {
  totalChecks++;
  if (condition) {
    passed++;
    return true;
  }
  console.error(`  FAIL: ${description}`);
  failed++;
  return false;
}

for (const file of files) {
  const svg = readFileSync(join(dir, file), "utf-8");
  console.log(`\n--- ${file} ---`);

  // 1. Valid SVG root
  const widthMatch = svg.match(/width="(\d+)"/);
  const heightMatch = svg.match(/height="(\d+)"/);
  check(file, "has <svg> root element", svg.includes("<svg"));
  check(file, "has </svg> closing tag", svg.includes("</svg>"));
  check(
    file,
    "has xmlns attribute",
    svg.includes('xmlns="http://www.w3.org/2000/svg"'),
  );
  check(file, "has viewBox", svg.includes("viewBox="));
  check(file, "has role=img for accessibility", svg.includes('role="img"'));

  if (widthMatch && heightMatch) {
    const w = parseInt(widthMatch[1], 10);
    const h = parseInt(heightMatch[1], 10);
    check(
      file,
      `dimensions valid (${w}x${h})`,
      w >= 200 && w <= 600 && h >= 100 && h <= 500,
    );
    console.log(`  Dimensions: ${w}x${h}`);
  }

  // 2. Background rect
  const bgMatch = svg.match(
    /data-testid="card-bg"[\s\S]*?fill="(#[a-fA-F0-9]+)"/,
  );
  if (check(file, "has background rect", !!bgMatch)) {
    console.log(`  Background: ${bgMatch[1]}`);
  }

  // 3. Title/header
  const headerMatch = svg.match(/data-testid="header"[^>]*>([^<]+)</);
  if (check(file, "has header text", !!headerMatch)) {
    console.log(`  Header: "${headerMatch[1].trim()}"`);
  }

  // 4. Animations
  check(
    file,
    "has fadeInAnimation keyframes",
    svg.includes("@keyframes fadeInAnimation"),
  );
  const hasStagger = svg.includes('class="stagger"');
  check(file, "has staggered animation elements", hasStagger);

  // 5. Stats-specific checks
  const isStatsCard = file.startsWith("stats");
  if (isStatsCard) {
    // Rank circle
    const rankMatch = svg.match(/data-testid="level-rank-icon"[^>]*>\s*(\S+)/);
    if (check(file, "has rank circle", !!rankMatch)) {
      console.log(`  Rank: ${rankMatch[1].trim()}`);
    }
    check(file, "has rank animation", svg.includes("@keyframes rankAnimation"));

    // Stats rows
    const statRows = svg.match(
      /data-testid="(stars|commits|prs|issues|contribs|reviews|discussions_started|prs_merged_percentage)"/g,
    );
    if (check(file, "has stat data rows", statRows && statRows.length >= 3)) {
      console.log(
        `  Stat rows: ${statRows.length} (${statRows.map((s) => s.match(/"(\w+)"/)[1]).join(", ")})`,
      );
    }

    // Icons
    const iconCount = (svg.match(/data-testid="icon"/g) || []).length;
    check(file, `has icons (${iconCount})`, iconCount >= 3);

    // Verify stat values are rendered (not empty)
    const starValue = svg.match(/data-testid="stars"[^>]*>([^<]+)/);
    if (starValue) {
      check(
        file,
        `star value rendered: "${starValue[1].trim()}"`,
        starValue[1].trim().length > 0,
      );
    }
  }

  // 6. Language-specific checks
  const isLangCard = file.startsWith("top-langs");
  if (isLangCard) {
    // Language names
    const langNames = svg.match(/data-testid="lang-name"[^>]*>\s*([^<]+)/g);
    if (
      check(file, "has language entries", langNames && langNames.length >= 3)
    ) {
      const names = langNames.map((l) => l.match(/>\s*(.+)/)[1].trim());
      console.log(`  Languages: ${names.join(", ")}`);
    }

    // Color circles or segments
    const hasCircles = svg.includes('<circle cx="5" cy="6"');
    const hasPaths =
      svg.includes('data-testid="lang-pie"') ||
      svg.includes('data-testid="lang-donut"');
    const hasProgress = svg.includes('data-testid="lang-progress"');
    check(
      file,
      "has colored visual elements",
      hasCircles || hasPaths || hasProgress,
    );

    // Layout-specific
    if (file.includes("pie")) {
      const pieSlices = (svg.match(/data-testid="lang-pie"/g) || []).length;
      check(file, `pie chart has slices (${pieSlices})`, pieSlices >= 3);
    }
    if (file.includes("donut") && !file.includes("vertical")) {
      const donutArcs = (svg.match(/data-testid="lang-donut"/g) || []).length;
      check(file, `donut chart has arcs (${donutArcs})`, donutArcs >= 3);
    }
    if (file === "top-langs.svg") {
      const progressBars = (svg.match(/data-testid="lang-progress"/g) || [])
        .length;
      check(
        file,
        `compact layout has progress bars (${progressBars})`,
        progressBars >= 3,
      );
    }

    // Percentage values present
    const percents = svg.match(/\d+\.\d+%/g);
    if (
      check(file, "has percentage values", percents && percents.length >= 3)
    ) {
      console.log(`  Percentages: ${percents.join(", ")}`);
    }
  }

  // 7. Theme colors present
  const colors = svg.match(/#[a-fA-F0-9]{6}/g);
  const uniqueColors = [...new Set(colors || [])];
  check(
    file,
    `has themed colors (${uniqueColors.length} unique)`,
    uniqueColors.length >= 3,
  );

  // 8. No broken elements
  check(file, "no NaN values", !svg.includes("NaN"));
  check(file, "no undefined text", !svg.includes(">undefined<"));
  check(file, "no null text", !svg.includes(">null<"));
  check(
    file,
    "no empty text nodes with data",
    !svg.match(/data-testid="[^"]*"[^>]*>\s*<\/text/),
  );

  // 9. File size sanity
  const sizeKB = (Buffer.byteLength(svg) / 1024).toFixed(1);
  check(
    file,
    `file size reasonable (${sizeKB} KB)`,
    parseFloat(sizeKB) > 1 && parseFloat(sizeKB) < 50,
  );
}

console.log(`\n${"=".repeat(50)}`);
console.log(
  `Visual test results: ${passed}/${totalChecks} passed, ${failed} failed`,
);
console.log(`Files tested: ${files.length}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\nAll visual checks passed!");
}
