// @ts-check

/**
 * @file Centralized input validation for API query parameters.
 *
 * Provides reusable validators and a middleware-style pattern
 * for consistent validation across all API endpoints.
 */

import { renderError } from "./render.js";

/** Valid layout values for the top-languages card. */
const VALID_TOP_LANG_LAYOUTS = [
  "compact",
  "normal",
  "donut",
  "donut-vertical",
  "pie",
];

/** Valid layout values for the wakatime card. */
const VALID_WAKATIME_LAYOUTS = ["compact", "normal"];

/** Valid stats format values. */
const VALID_STATS_FORMATS = ["bytes", "percentages"];

/** Valid display format values. */
const VALID_DISPLAY_FORMATS = ["time", "percent"];

/** Valid rank icon values. */
const VALID_RANK_ICONS = ["default", "github", "percentile"];

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid Whether validation passed.
 * @property {string} [errorSvg] SVG error string if validation failed.
 */

/**
 * Validate that a string parameter is one of the allowed values.
 *
 * @param {object} params Validation params.
 * @param {string | undefined} params.value The value to validate.
 * @param {string[]} params.allowed Array of allowed values.
 * @param {string} params.paramName Name of the parameter (for error message).
 * @param {object} params.colors Colors for the error card.
 * @returns {ValidationResult} Validation result.
 */
const validateEnum = ({ value, allowed, paramName, colors }) => {
  if (
    value !== undefined &&
    (typeof value !== "string" || !allowed.includes(value))
  ) {
    return {
      isValid: false,
      errorSvg: renderError({
        message: "Something went wrong",
        secondaryMessage: `Invalid ${paramName}: must be one of ${allowed.join(", ")}`,
        renderOptions: colors,
      }),
    };
  }
  return { isValid: true };
};

/**
 * Validate that a numeric parameter is within bounds.
 *
 * @param {object} params Validation params.
 * @param {string | number | undefined} params.value The value to validate.
 * @param {number} params.min Minimum value (inclusive).
 * @param {number} params.max Maximum value (inclusive).
 * @param {string} params.paramName Name of the parameter (for error message).
 * @param {object} params.colors Colors for the error card.
 * @returns {ValidationResult} Validation result.
 */
const validateNumericRange = ({ value, min, max, paramName, colors }) => {
  if (value === undefined || value === "") {
    return { isValid: true };
  }
  const num = Number(value);
  if (isNaN(num) || num < min || num > max) {
    return {
      isValid: false,
      errorSvg: renderError({
        message: "Something went wrong",
        secondaryMessage: `Invalid ${paramName}: must be a number between ${min} and ${max}`,
        renderOptions: colors,
      }),
    };
  }
  return { isValid: true };
};

export {
  VALID_TOP_LANG_LAYOUTS,
  VALID_WAKATIME_LAYOUTS,
  VALID_STATS_FORMATS,
  VALID_DISPLAY_FORMATS,
  VALID_RANK_ICONS,
  validateEnum,
  validateNumericRange,
};
