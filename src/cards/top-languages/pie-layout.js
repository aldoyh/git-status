// @ts-check

/**
 * @file Pie layout renderer for the top-languages card.
 */

import { CARD_PADDING } from "./constants.js";
import { createLanguageTextNode } from "./compact-layout.js";
import { polarToCartesian } from "./utils.js";

/**
 * @typedef {import("../../fetchers/types").Lang} Lang
 */

/**
 * Calculates height for the pie layout.
 *
 * @param {number} totalLangs Total number of languages.
 * @returns {number} Card height.
 */
export const calculatePieLayoutHeight = (totalLangs) => {
  return 300 + Math.round(totalLangs / 2) * 25;
};

/**
 * Renders pie layout to display user's most frequently used programming languages.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} totalLanguageSize Total size of all languages.
 * @param {string} statsFormat Stats format.
 * @returns {string} Pie layout card SVG object.
 */
export const renderPieLayout = (langs, totalLanguageSize, statsFormat) => {
  const radius = 90;
  const centerX = 150;
  const centerY = 100;

  let startAngle = 0;
  let startDelayCoefficient = 1;
  const paths = [];

  for (const lang of langs) {
    if (langs.length === 1) {
      paths.push(`
        <circle
          cx="${centerX}"
          cy="${centerY}"
          r="${radius}"
          stroke="none"
          fill="${lang.color}"
          data-testid="lang-pie"
          size="100"
        />
      `);
      break;
    }

    const langSizePart = lang.size / totalLanguageSize;
    const percentage = langSizePart * 100;
    const angle = langSizePart * 360;
    const endAngle = startAngle + angle;

    const startPoint = polarToCartesian(centerX, centerY, radius, startAngle);
    const endPoint = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const delay = startDelayCoefficient * 100;

    paths.push(`
      <g class="stagger" style="animation-delay: ${delay}ms">
        <path
          data-testid="lang-pie"
          size="${percentage}"
          d="M ${centerX} ${centerY} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} Z"
          fill="${lang.color}"
        />
      </g>
    `);

    startAngle = endAngle;
    startDelayCoefficient += 1;
  }

  return `
    <svg data-testid="lang-items">
      <g transform="translate(0, 0)">
        <svg data-testid="pie">
          ${paths.join("")}
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
