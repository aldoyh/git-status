// @ts-check

/**
 * @file Compact layout renderer for the top-languages card.
 */

import { chunkArray } from "../../common/ops.js";
import { flexLayout, measureText } from "../../common/render.js";
import { COMPACT_LAYOUT_BASE_HEIGHT } from "./constants.js";
import { getDisplayValue, getLongestLang } from "./utils.js";

/**
 * @typedef {import("../../fetchers/types").Lang} Lang
 */

/**
 * Calculates height for the compact layout.
 *
 * @param {number} totalLangs Total number of languages.
 * @returns {number} Card height.
 */
export const calculateCompactLayoutHeight = (totalLangs) => {
  return COMPACT_LAYOUT_BASE_HEIGHT + Math.round(totalLangs / 2) * 25;
};

/**
 * Creates compact text item for a single programming language.
 *
 * @param {object} props Function properties.
 * @param {Lang} props.lang Programming language object.
 * @param {number} props.totalSize Total size of all languages.
 * @param {boolean=} props.hideProgress Whether to hide percentage.
 * @param {string=} props.statsFormat Stats format.
 * @param {number} props.index Index of the programming language.
 * @returns {string} Compact layout programming language SVG node.
 */
export const createCompactLangNode = ({
  lang,
  totalSize,
  hideProgress,
  statsFormat = "percentages",
  index,
}) => {
  const percentages = (lang.size / totalSize) * 100;
  const displayValue = getDisplayValue(lang.size, percentages, statsFormat);

  const staggerDelay = (index + 3) * 150;
  const color = lang.color || "#858585";

  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms">
      <circle cx="5" cy="6" r="5" fill="${color}" />
      <text data-testid="lang-name" x="15" y="10" class='lang-name'>
        ${lang.name} ${hideProgress ? "" : displayValue}
      </text>
    </g>
  `;
};

/**
 * Create compact languages text items arranged in two columns.
 *
 * @param {object} props Function properties.
 * @param {Lang[]} props.langs Array of programming languages.
 * @param {number} props.totalSize Total size of all languages.
 * @param {boolean=} props.hideProgress Whether to hide percentage.
 * @param {string=} props.statsFormat Stats format.
 * @returns {string} Programming languages SVG node.
 */
export const createLanguageTextNode = ({
  langs,
  totalSize,
  hideProgress,
  statsFormat,
}) => {
  const longestLang = getLongestLang(langs);
  const chunked = chunkArray(langs, langs.length / 2);
  const layouts = chunked.map((array) => {
    // @ts-ignore
    const items = array.map((lang, index) =>
      createCompactLangNode({
        lang,
        totalSize,
        hideProgress,
        statsFormat,
        index,
      }),
    );
    return flexLayout({
      items,
      gap: 25,
      direction: "column",
    }).join("");
  });

  const percent = ((longestLang.size / totalSize) * 100).toFixed(2);
  const minGap = 150;
  const maxGap = 20 + measureText(`${longestLang.name} ${percent}%`, 11);
  return flexLayout({
    items: layouts,
    gap: maxGap < minGap ? minGap : maxGap,
  }).join("");
};

/**
 * Renders the compact language card layout.
 *
 * @param {Lang[]} langs Array of programming languages.
 * @param {number} width Card width.
 * @param {number} totalLanguageSize Total size of all languages.
 * @param {boolean=} hideProgress Whether to hide progress bar.
 * @param {string} statsFormat Stats format.
 * @returns {string} Compact layout card SVG object.
 */
export const renderCompactLayout = (
  langs,
  width,
  totalLanguageSize,
  hideProgress,
  statsFormat = "percentages",
) => {
  const paddingRight = 50;
  const offsetWidth = width - paddingRight;
  let progressOffset = 0;

  const compactProgressBar = langs
    .map((lang) => {
      const percentage = parseFloat(
        ((lang.size / totalLanguageSize) * offsetWidth).toFixed(2),
      );

      const progress = percentage < 10 ? percentage + 10 : percentage;

      const output = `
        <rect
          mask="url(#rect-mask)"
          data-testid="lang-progress"
          x="${progressOffset}"
          y="0"
          width="${progress}"
          height="8"
          fill="${lang.color || "#858585"}"
        />
      `;
      progressOffset += percentage;
      return output;
    })
    .join("");

  return `
  ${
    hideProgress
      ? ""
      : `
      <mask id="rect-mask">
          <rect x="0" y="0" width="${offsetWidth}" height="8" fill="white" rx="5"/>
        </mask>
        ${compactProgressBar}
      `
  }
    <g transform="translate(0, ${hideProgress ? "0" : "25"})">
      ${createLanguageTextNode({
        langs,
        totalSize: totalLanguageSize,
        hideProgress,
        statsFormat,
      })}
    </g>
  `;
};
