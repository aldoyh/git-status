// @ts-check

/**
 * @file Donut layout renderer for the top-languages card.
 */

import { flexLayout } from "../../common/render.js";
import { polarToCartesian } from "./utils.js";
import { createCompactLangNode } from "./compact-layout.js";

/**
 * @typedef {import("../../fetchers/types").Lang} Lang
 */

/**
 * Calculates height for the donut layout.
 *
 * @param {number} totalLangs Total number of languages.
 * @returns {number} Card height.
 */
export const calculateDonutLayoutHeight = (totalLangs) => {
  return 215 + Math.max(totalLangs - 5, 0) * 32;
};

/**
 * Calculates the center translation needed to keep the donut chart centred.
 *
 * @param {number} totalLangs Total number of languages.
 * @returns {number} Donut center translation.
 */
export const donutCenterTranslation = (totalLangs) => {
  return -45 + Math.max(totalLangs - 5, 0) * 16;
};

/**
 * Create donut languages text items for all programming languages.
 *
 * @param {object} props Function properties.
 * @param {Lang[]} props.langs Array of programming languages.
 * @param {number} props.totalSize Total size of all languages.
 * @param {string} props.statsFormat Stats format.
 * @returns {string} Donut layout programming language SVG node.
 */
const createDonutLanguagesNode = ({ langs, totalSize, statsFormat }) => {
  return flexLayout({
    items: langs.map((lang, index) => {
      return createCompactLangNode({
        lang,
        totalSize,
        hideProgress: false,
        statsFormat,
        index,
      });
    }),
    gap: 32,
    direction: "column",
  }).join("");
};

/**
 * Creates the SVG paths for the language donut chart.
 *
 * @param {number} cx Donut center x-position.
 * @param {number} cy Donut center y-position.
 * @param {number} radius Donut arc radius.
 * @param {number[]} percentages Array with donut section percentages.
 * @returns {{d: string, percent: number}[]} Array of svg path data objects.
 */
const createDonutPaths = (cx, cy, radius, percentages) => {
  const paths = [];
  let startAngle = 0;

  const totalPercent = percentages.reduce((acc, curr) => acc + curr, 0);
  for (let i = 0; i < percentages.length; i++) {
    const percent = parseFloat(
      ((percentages[i] / totalPercent) * 100).toFixed(2),
    );

    const endAngle = 3.6 * percent + startAngle;
    // Rotate donut 90 degrees counter-clockwise.
    const startPoint = polarToCartesian(cx, cy, radius, endAngle - 90);
    const endPoint = polarToCartesian(cx, cy, radius, startAngle - 90);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    paths.push({
      percent,
      d: `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y}`,
    });

    startAngle = endAngle;
  }

  return paths;
};

/**
 * Renders the donut language card layout.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} width Card width.
 * @param {number} totalLanguageSize Total size of all languages.
 * @param {string} statsFormat Stats format.
 * @returns {string} Donut layout card SVG object.
 */
export const renderDonutLayout = (
  langs,
  width,
  totalLanguageSize,
  statsFormat,
) => {
  const centerX = width / 3;
  const centerY = width / 3;
  const radius = centerX - 60;
  const strokeWidth = 12;

  const colors = langs.map((lang) => lang.color);
  const langsPercents = langs.map((lang) =>
    parseFloat(((lang.size / totalLanguageSize) * 100).toFixed(2)),
  );

  const langPaths = createDonutPaths(centerX, centerY, radius, langsPercents);

  const donutPaths =
    langs.length === 1
      ? `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${colors[0]}" fill="none" stroke-width="${strokeWidth}" data-testid="lang-donut" size="100"/>`
      : langPaths
          .map((section, index) => {
            const staggerDelay = (index + 3) * 100;
            const delay = staggerDelay + 300;

            return `
       <g class="stagger" style="animation-delay: ${delay}ms">
        <path
          data-testid="lang-donut"
          size="${section.percent}"
          d="${section.d}"
          stroke="${colors[index]}"
          fill="none"
          stroke-width="${strokeWidth}">
        </path>
      </g>
      `;
          })
          .join("");

  const donut = `<svg width="${width}" height="${width}">${donutPaths}</svg>`;

  return `
    <g transform="translate(0, 0)">
      <g transform="translate(0, 0)">
        ${createDonutLanguagesNode({ langs, totalSize: totalLanguageSize, statsFormat })}
      </g>

      <g transform="translate(125, ${donutCenterTranslation(langs.length)})">
        ${donut}
      </g>
    </g>
  `;
};
