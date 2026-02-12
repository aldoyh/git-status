// @ts-check

/**
 * @file Constants for the top-languages card layouts.
 */

/** Default card width in pixels. */
export const DEFAULT_CARD_WIDTH = 300;

/** Minimum card width in pixels. */
export const MIN_CARD_WIDTH = 280;

/** Default language color when none is provided. */
export const DEFAULT_LANG_COLOR = "#858585";

/** Card inner padding in pixels. */
export const CARD_PADDING = 25;

/** Base height for compact layout in pixels. */
export const COMPACT_LAYOUT_BASE_HEIGHT = 90;

/** Maximum number of languages that can be displayed. */
export const MAXIMUM_LANGS_COUNT = 20;

/** Default language counts per layout type. */
export const DEFAULT_LANGS_COUNT = {
  normal: 5,
  compact: 6,
  donut: 5,
  pie: 6,
  "donut-vertical": 6,
};

/** All valid layout types. */
export const VALID_LAYOUTS = [
  "compact",
  "normal",
  "donut",
  "donut-vertical",
  "pie",
];
