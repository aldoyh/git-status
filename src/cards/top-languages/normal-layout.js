// @ts-check

/**
 * @file Normal (default) layout renderer for the top-languages card.
 */

import { createProgressNode, flexLayout } from "../../common/render.js";
import { getDisplayValue, resolveLangColor } from "./utils.js";

/**
 * @typedef {import("../../fetchers/types").Lang} Lang
 */

/**
 * Calculates height for the normal layout.
 *
 * @param {number} totalLangs Total number of languages.
 * @returns {number} Card height.
 */
export const calculateNormalLayoutHeight = (totalLangs) => {
  return 45 + (totalLangs + 1) * 40;
};

/**
 * Create progress bar text item for a programming language.
 *
 * @param {object} props Function properties.
 * @param {number} props.width The card width.
 * @param {string} props.color Color of the programming language.
 * @param {string} props.name Name of the programming language.
 * @param {number} props.size Size of the programming language.
 * @param {number} props.totalSize Total size of all languages.
 * @param {string} props.statsFormat Stats format.
 * @param {number} props.index Index of the programming language.
 * @returns {string} Programming language SVG node.
 */
const createProgressTextNode = ({
  width,
  color,
  name,
  size,
  totalSize,
  statsFormat,
  index,
}) => {
  const staggerDelay = (index + 3) * 150;
  const paddingRight = 95;
  const progressTextX = width - paddingRight + 10;
  const progressWidth = width - paddingRight;

  const progress = (size / totalSize) * 100;
  const displayValue = getDisplayValue(size, progress, statsFormat);

  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms">
      <text data-testid="lang-name" x="2" y="15" class="lang-name">${name}</text>
      <text x="${progressTextX}" y="34" class="lang-name">${displayValue}</text>
      ${createProgressNode({
        x: 0,
        y: 25,
        color,
        width: progressWidth,
        progress,
        progressBarBackgroundColor: "#ddd",
        delay: staggerDelay + 300,
      })}
    </g>
  `;
};

/**
 * Renders the default (normal) language card layout.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} width Card width.
 * @param {number} totalLanguageSize Total size of all languages.
 * @param {string} statsFormat Stats format.
 * @returns {string} Normal layout card SVG object.
 */
export const renderNormalLayout = (
  langs,
  width,
  totalLanguageSize,
  statsFormat,
) => {
  return flexLayout({
    items: langs.map((lang, index) => {
      return createProgressTextNode({
        width,
        name: lang.name,
        color: resolveLangColor(lang.color),
        size: lang.size,
        totalSize: totalLanguageSize,
        statsFormat,
        index,
      });
    }),
    gap: 40,
    direction: "column",
  }).join("");
};
