// @ts-check

/**
 * @file Top languages card - main entry point.
 *
 * Layout renderers are split into individual modules under ./top-languages/
 * for maintainability. This file orchestrates layout selection and card rendering.
 */

import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { I18n } from "../common/I18n.js";
import { langCardLocales } from "../translations.js";

import {
  DEFAULT_CARD_WIDTH,
  MIN_CARD_WIDTH,
  CARD_PADDING,
  COMPACT_LAYOUT_BASE_HEIGHT,
  DEFAULT_LANGS_COUNT,
} from "./top-languages/constants.js";

import {
  getLongestLang,
  degreesToRadians,
  radiansToDegrees,
  polarToCartesian,
  cartesianToPolar,
  getCircleLength,
  trimTopLanguages,
} from "./top-languages/utils.js";

import {
  calculateNormalLayoutHeight,
  renderNormalLayout,
} from "./top-languages/normal-layout.js";

import {
  calculateCompactLayoutHeight,
  renderCompactLayout,
} from "./top-languages/compact-layout.js";

import {
  calculateDonutLayoutHeight,
  donutCenterTranslation,
  renderDonutLayout,
} from "./top-languages/donut-layout.js";

import {
  calculateDonutVerticalLayoutHeight,
  renderDonutVerticalLayout,
} from "./top-languages/donut-vertical-layout.js";

import {
  calculatePieLayoutHeight,
  renderPieLayout,
} from "./top-languages/pie-layout.js";

/**
 * @typedef {import("./types").TopLangOptions} TopLangOptions
 * @typedef {TopLangOptions["layout"]} Layout
 */

/**
 * Creates the no languages data SVG node.
 *
 * @param {object} props Object with function properties.
 * @param {string} props.color No languages data text color.
 * @param {string} props.text No languages data translated text.
 * @param {Layout | undefined} props.layout Card layout.
 * @returns {string} No languages data SVG node string.
 */
const noLanguagesDataNode = ({ color, text, layout }) => {
  return `
    <text x="${
      layout === "pie" || layout === "donut-vertical" ? CARD_PADDING : 0
    }" y="11" class="stat bold" fill="${color}">${text}</text>
  `;
};

/**
 * Get default languages count for provided card layout.
 *
 * @param {object} props Function properties.
 * @param {Layout=} props.layout Input layout string.
 * @param {boolean=} props.hide_progress Input hide_progress parameter value.
 * @returns {number} Default languages count for input layout.
 */
const getDefaultLanguagesCountByLayout = ({ layout, hide_progress }) => {
  if (layout === "compact" || hide_progress === true) {
    return DEFAULT_LANGS_COUNT.compact;
  }
  return DEFAULT_LANGS_COUNT[layout || "normal"] || DEFAULT_LANGS_COUNT.normal;
};

/**
 * @typedef {import('../fetchers/types').TopLangData} TopLangData
 */

/**
 * Renders card that display user's most frequently used programming languages.
 *
 * @param {TopLangData} topLangs User's most frequently used programming languages.
 * @param {Partial<TopLangOptions>} options Card options.
 * @returns {string} Language card SVG object.
 */
const renderTopLanguages = (topLangs, options = {}) => {
  const {
    hide_title = false,
    hide_border = false,
    card_width,
    title_color,
    text_color,
    bg_color,
    hide,
    hide_progress,
    theme,
    layout,
    custom_title,
    locale,
    langs_count = getDefaultLanguagesCountByLayout({ layout, hide_progress }),
    border_radius,
    border_color,
    disable_animations,
    stats_format = "percentages",
  } = options;

  const i18n = new I18n({
    locale,
    translations: langCardLocales,
  });

  const { langs, totalLanguageSize } = trimTopLanguages(
    topLangs,
    langs_count,
    hide,
  );

  let width = card_width
    ? isNaN(card_width)
      ? DEFAULT_CARD_WIDTH
      : card_width < MIN_CARD_WIDTH
        ? MIN_CARD_WIDTH
        : card_width
    : DEFAULT_CARD_WIDTH;
  let height = calculateNormalLayoutHeight(langs.length);

  const colors = getCardColors({
    title_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });

  let finalLayout = "";
  if (langs.length === 0) {
    height = COMPACT_LAYOUT_BASE_HEIGHT;
    finalLayout = noLanguagesDataNode({
      color: colors.textColor,
      text: i18n.t("langcard.nodata"),
      layout,
    });
  } else if (layout === "pie") {
    height = calculatePieLayoutHeight(langs.length);
    finalLayout = renderPieLayout(langs, totalLanguageSize, stats_format);
  } else if (layout === "donut-vertical") {
    height = calculateDonutVerticalLayoutHeight(langs.length);
    finalLayout = renderDonutVerticalLayout(
      langs,
      totalLanguageSize,
      stats_format,
    );
  } else if (layout === "compact" || hide_progress == true) {
    height =
      calculateCompactLayoutHeight(langs.length) + (hide_progress ? -25 : 0);

    finalLayout = renderCompactLayout(
      langs,
      width,
      totalLanguageSize,
      hide_progress,
      stats_format,
    );
  } else if (layout === "donut") {
    height = calculateDonutLayoutHeight(langs.length);
    width = width + 50; // padding
    finalLayout = renderDonutLayout(
      langs,
      width,
      totalLanguageSize,
      stats_format,
    );
  } else {
    finalLayout = renderNormalLayout(
      langs,
      width,
      totalLanguageSize,
      stats_format,
    );
  }

  const card = new Card({
    customTitle: custom_title,
    defaultTitle: i18n.t("langcard.title"),
    width,
    height,
    border_radius,
    colors,
  });

  if (disable_animations) {
    card.disableAnimations();
  }

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  card.setCSS(
    `
    @keyframes slideInAnimation {
      from {
        width: 0;
      }
      to {
        width: calc(100%-100px);
      }
    }
    @keyframes growWidthAnimation {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${colors.textColor};
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }
    .bold { font-weight: 700 }
    .lang-name {
      font: 400 11px "Segoe UI", Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    #rect-mask rect{
      animation: slideInAnimation 1s ease-in-out forwards;
    }
    .lang-progress{
      animation: growWidthAnimation 0.6s ease-in-out forwards;
    }
    `,
  );

  if (layout === "pie" || layout === "donut-vertical") {
    return card.render(finalLayout);
  }

  return card.render(`
    <svg data-testid="lang-items" x="${CARD_PADDING}">
      ${finalLayout}
    </svg>
  `);
};

export {
  getLongestLang,
  degreesToRadians,
  radiansToDegrees,
  polarToCartesian,
  cartesianToPolar,
  getCircleLength,
  calculateCompactLayoutHeight,
  calculateNormalLayoutHeight,
  calculateDonutLayoutHeight,
  calculateDonutVerticalLayoutHeight,
  calculatePieLayoutHeight,
  donutCenterTranslation,
  trimTopLanguages,
  renderTopLanguages,
  MIN_CARD_WIDTH,
  getDefaultLanguagesCountByLayout,
};
