#!/usr/bin/env node

/**
 * @file Generate GitHub stats SVG cards locally using the project's own
 * fetchers and renderers — no external API dependency.
 *
 * Usage:
 *   PAT_1=ghp_xxx node scripts/generate-cards.js <username> [output-dir]
 *
 * Environment variables:
 *   PAT_1          — GitHub Personal Access Token (required)
 *   OUTPUT_DIR     — Output directory (default: ./generated)
 *   GITHUB_USERNAME — GitHub username (alternative to CLI arg)
 *
 * Generated files:
 *   stats.svg              — GitHub stats card (radical theme)
 *   stats-dark.svg         — GitHub stats card (dark theme)
 *   top-langs.svg          — Top languages compact layout
 *   top-langs-donut.svg    — Top languages donut layout
 *   top-langs-pie.svg      — Top languages pie layout
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import * as dotenv from "dotenv";

dotenv.config();

import { fetchStats } from "../src/fetchers/stats.js";
import { fetchTopLanguages } from "../src/fetchers/top-languages.js";
import { renderStatsCard } from "../src/cards/stats.js";
import { renderTopLanguages } from "../src/cards/top-languages.js";

const username = process.argv[2] || process.env.GITHUB_USERNAME;
const outputDir = resolve(
  process.argv[3] || process.env.OUTPUT_DIR || "./generated",
);

if (!username) {
  console.error(
    "Usage: node scripts/generate-cards.js <username> [output-dir]",
  );
  console.error("   or: GITHUB_USERNAME=<user> node scripts/generate-cards.js");
  process.exit(1);
}

if (!process.env.PAT_1) {
  console.error("Error: PAT_1 environment variable is required.");
  console.error("Set it to a GitHub Personal Access Token.");
  process.exit(1);
}

/**
 * Card definitions — each entry describes one SVG to generate.
 *
 * @typedef {Object} CardDef
 * @property {string} filename Output filename.
 * @property {string} label Human-readable label for logging.
 * @property {() => Promise<string>} generate Async function returning SVG string.
 */

/** @type {CardDef[]} */
const cards = [
  {
    filename: "stats.svg",
    label: "Stats card (radical)",
    generate: async () => {
      const stats = await fetchStats(username);
      return renderStatsCard(stats, {
        show_icons: true,
        theme: "radical",
      });
    },
  },
  {
    filename: "stats-dark.svg",
    label: "Stats card (dark)",
    generate: async () => {
      const stats = await fetchStats(username);
      return renderStatsCard(stats, {
        show_icons: true,
        theme: "dark",
      });
    },
  },
  {
    filename: "top-langs.svg",
    label: "Top languages (compact)",
    generate: async () => {
      const langs = await fetchTopLanguages(username);
      return renderTopLanguages(langs, {
        layout: "compact",
        theme: "radical",
      });
    },
  },
  {
    filename: "top-langs-donut.svg",
    label: "Top languages (donut)",
    generate: async () => {
      const langs = await fetchTopLanguages(username);
      return renderTopLanguages(langs, {
        layout: "donut",
        theme: "radical",
      });
    },
  },
  {
    filename: "top-langs-pie.svg",
    label: "Top languages (pie)",
    generate: async () => {
      const langs = await fetchTopLanguages(username);
      return renderTopLanguages(langs, {
        layout: "pie",
        theme: "radical",
      });
    },
  },
];

/** Generate all configured stats cards and write them to disk. */
async function main() {
  console.log(`Generating stats cards for: ${username}`);
  console.log(`Output directory: ${outputDir}\n`);

  mkdirSync(outputDir, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const card of cards) {
    try {
      const svg = await card.generate();
      const outPath = join(outputDir, card.filename);
      writeFileSync(outPath, svg);
      console.log(`  ✅ ${card.label} → ${card.filename}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${card.label}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} generated, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
