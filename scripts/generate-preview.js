#!/usr/bin/env node

/**
 * @file Generate preview SVG cards using mock data — no GitHub token required.
 * Used to verify that the rendering pipeline produces valid SVG output.
 *
 * Usage:
 *   node scripts/generate-preview.js [output-dir]
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { renderStatsCard } from "../src/cards/stats.js";
import { renderTopLanguages } from "../src/cards/top-languages.js";

const outputDir = resolve(process.argv[2] || "./generated");

/** @type {import("../src/fetchers/types").StatsData} */
const mockStats = {
  name: "Aldo Yerga Hernandez",
  totalPRs: 142,
  totalPRsMerged: 118,
  mergedPRsPercentage: 83.1,
  totalReviews: 256,
  totalCommits: 1847,
  totalIssues: 93,
  totalStars: 512,
  totalDiscussionsStarted: 15,
  totalDiscussionsAnswered: 42,
  contributedTo: 37,
  rank: { level: "A+", percentile: 12.5 },
};

/** @type {import("../src/fetchers/types").TopLangData} */
const mockLangs = {
  JavaScript: { name: "JavaScript", color: "#f1e05a", size: 245000 },
  TypeScript: { name: "TypeScript", color: "#3178c6", size: 189000 },
  Python: { name: "Python", color: "#3572A5", size: 134000 },
  Rust: { name: "Rust", color: "#dea584", size: 87000 },
  Go: { name: "Go", color: "#00ADD8", size: 62000 },
  Shell: { name: "Shell", color: "#89e051", size: 31000 },
  HTML: { name: "HTML", color: "#e34c26", size: 28000 },
  CSS: { name: "CSS", color: "#563d7c", size: 19000 },
};

const cards = [
  {
    filename: "stats.svg",
    label: "Stats card (radical)",
    svg: renderStatsCard(mockStats, {
      show_icons: true,
      theme: "radical",
      include_all_commits: true,
      show: ["reviews", "discussions_started", "prs_merged_percentage"],
    }),
  },
  {
    filename: "stats-dark.svg",
    label: "Stats card (dark)",
    svg: renderStatsCard(mockStats, {
      show_icons: true,
      theme: "dark",
      include_all_commits: true,
    }),
  },
  {
    filename: "top-langs.svg",
    label: "Top languages (compact)",
    svg: renderTopLanguages(mockLangs, {
      layout: "compact",
      theme: "radical",
      langs_count: 8,
    }),
  },
  {
    filename: "top-langs-donut.svg",
    label: "Top languages (donut)",
    svg: renderTopLanguages(mockLangs, {
      layout: "donut",
      theme: "radical",
      langs_count: 8,
    }),
  },
  {
    filename: "top-langs-pie.svg",
    label: "Top languages (pie)",
    svg: renderTopLanguages(mockLangs, {
      layout: "pie",
      theme: "radical",
      langs_count: 8,
    }),
  },
  {
    filename: "top-langs-normal.svg",
    label: "Top languages (normal)",
    svg: renderTopLanguages(mockLangs, {
      layout: "normal",
      theme: "radical",
      langs_count: 8,
    }),
  },
  {
    filename: "top-langs-donut-vertical.svg",
    label: "Top languages (donut-vertical)",
    svg: renderTopLanguages(mockLangs, {
      layout: "donut-vertical",
      theme: "radical",
      langs_count: 8,
    }),
  },
];

mkdirSync(outputDir, { recursive: true });

let success = 0;
let failed = 0;

for (const card of cards) {
  try {
    const outPath = join(outputDir, card.filename);
    writeFileSync(outPath, card.svg);

    // Validate SVG
    const isSvg = card.svg.includes("<svg") && card.svg.includes("</svg>");
    const sizeKB = (Buffer.byteLength(card.svg) / 1024).toFixed(1);

    if (isSvg) {
      console.log(`  ✅ ${card.label} → ${card.filename} (${sizeKB} KB)`);
      success++;
    } else {
      console.error(`  ❌ ${card.label}: output is not valid SVG`);
      failed++;
    }
  } catch (err) {
    console.error(`  ❌ ${card.label}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${success} generated, ${failed} failed.`);
console.log(`Output: ${outputDir}/`);

if (failed > 0) {
  process.exit(1);
}
