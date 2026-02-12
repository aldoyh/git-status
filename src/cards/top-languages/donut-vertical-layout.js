// @ts-check

/**
 * @file Donut-vertical layout renderer for the top-languages card.
 */

import { CARD_PADDING } from "./constants.js";
import { createLanguageTextNode } from "./compact-layout.js";
import { getCircleLength } from "./utils.js";

/**
 * @typedef {import("../../fetchers/types").Lang} Lang
 */

/**
 * Calculates height for the donut vertical layout.
 *
 * @param {number} totalLangs Total number of languages.
 * @returns {number} Card height.
 */
export const calculateDonutVerticalLayoutHeight = (totalLangs) => {
  return 300 + Math.round(totalLangs / 2) * 25;
};

/**
 * Renders donut-vertical layout to display user's most frequently used programming languages.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} totalLanguageSize Total size of all languages.
 * @param {string} statsFormat Stats format.
 * @returns {string} Donut-vertical layout card SVG object.
 */
export const renderDonutVerticalLayout = (
  langs,
  totalLanguageSize,
  statsFormat,
) => {
  const radius = 80;
  const totalCircleLength = getCircleLength(radius);

  const circles = [];
  let indent = 0;
  let startDelayCoefficient = 1;

  for (const lang of langs) {
    const percentage = (lang.size / totalLanguageSize) * 100;
    const circleLength = totalCircleLength * (percentage / 100);
    const delay = startDelayCoefficient * 100;

    circles.push(`
      <g class="stagger" style="animation-delay: ${delay}ms">
        <circle
          cx="150"
          cy="100"
          r="${radius}"
          fill="transparent"
          stroke="${lang.color}"
          stroke-width="25"
          stroke-dasharray="${totalCircleLength}"
          stroke-dashoffset="${indent}"
          size="${percentage}"
          data-testid="lang-donut"
        />
      </g>
    `);

    indent += circleLength;
    startDelayCoefficient += 1;
  }

  return `
    <svg data-testid="lang-items">
      <g transform="translate(0, 0)">
        <svg data-testid="donut">
          ${circles.join("")}
        </svg>
      </g>
      <g transform="translate(0, 220)">
        <svg data-testid="lang-names" x="${CARD_PADDING}">
          ${createLanguageTextNode({
            langs,
            totalSize: totalLanguageSize,
            hideProgress: false,
            statsFormat,
          })}
        </svg>
      </g>
    </svg>
  `;
};
