// @ts-check

/**
 * @file Shared utility functions for top-languages card layouts.
 */

import { formatBytes } from "../../common/fmt.js";
import { clampValue, lowercaseTrim } from "../../common/ops.js";
import { MAXIMUM_LANGS_COUNT, DEFAULT_LANG_COLOR } from "./constants.js";

/**
 * @typedef {import("../../fetchers/types").Lang} Lang
 */

/**
 * Retrieves the programming language whose name is the longest.
 *
 * @param {Lang[]} arr Array of programming languages.
 * @returns {Lang} Longest programming language object.
 */
export const getLongestLang = (arr) =>
  arr.reduce(
    (savedLang, lang) =>
      lang.name.length > savedLang.name.length ? lang : savedLang,
    { name: "", size: 0, color: "" },
  );

/**
 * Convert degrees to radians.
 *
 * @param {number} angleInDegrees Angle in degrees.
 * @returns {number} Angle in radians.
 */
export const degreesToRadians = (angleInDegrees) =>
  angleInDegrees * (Math.PI / 180.0);

/**
 * Convert radians to degrees.
 *
 * @param {number} angleInRadians Angle in radians.
 * @returns {number} Angle in degrees.
 */
export const radiansToDegrees = (angleInRadians) =>
  angleInRadians / (Math.PI / 180.0);

/**
 * Convert polar coordinates to cartesian coordinates.
 *
 * @param {number} centerX Center x coordinate.
 * @param {number} centerY Center y coordinate.
 * @param {number} radius Radius of the circle.
 * @param {number} angleInDegrees Angle in degrees.
 * @returns {{x: number, y: number}} Cartesian coordinates.
 */
export const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const rads = degreesToRadians(angleInDegrees);
  return {
    x: centerX + radius * Math.cos(rads),
    y: centerY + radius * Math.sin(rads),
  };
};

/**
 * Convert cartesian coordinates to polar coordinates.
 *
 * @param {number} centerX Center x coordinate.
 * @param {number} centerY Center y coordinate.
 * @param {number} x Point x coordinate.
 * @param {number} y Point y coordinate.
 * @returns {{radius: number, angleInDegrees: number}} Polar coordinates.
 */
export const cartesianToPolar = (centerX, centerY, x, y) => {
  const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  let angleInDegrees = radiansToDegrees(Math.atan2(y - centerY, x - centerX));
  if (angleInDegrees < 0) {
    angleInDegrees += 360;
  }
  return { radius, angleInDegrees };
};

/**
 * Calculates the circumference of a circle.
 *
 * @param {number} radius Radius of the circle.
 * @returns {number} The circumference of the circle.
 */
export const getCircleLength = (radius) => 2 * Math.PI * radius;

/**
 * Trim top languages to lang_count while also hiding certain languages.
 *
 * @param {Record<string, Lang>} topLangs Top languages.
 * @param {number} langs_count Number of languages to show.
 * @param {string[]=} hide Languages to hide.
 * @returns {{ langs: Lang[], totalLanguageSize: number }} Trimmed top languages and total size.
 */
export const trimTopLanguages = (topLangs, langs_count, hide) => {
  let langs = Object.values(topLangs);
  const langsToHide = new Set(
    (hide || []).map((langName) => lowercaseTrim(langName)),
  );
  const langsCount = clampValue(langs_count, 1, MAXIMUM_LANGS_COUNT);

  langs = langs
    .sort((a, b) => b.size - a.size)
    .filter((lang) => !langsToHide.has(lowercaseTrim(lang.name)))
    .slice(0, langsCount);

  const totalLanguageSize = langs.reduce((acc, curr) => acc + curr.size, 0);

  return { langs, totalLanguageSize };
};

/**
 * Get display value corresponding to the format.
 *
 * @param {number} size Bytes size.
 * @param {number} percentages Percentage value.
 * @param {string} format Format of the stats ("bytes" or "percentages").
 * @returns {string} Display value.
 */
export const getDisplayValue = (size, percentages, format) => {
  return format === "bytes" ? formatBytes(size) : `${percentages.toFixed(2)}%`;
};

/**
 * Resolves a language color, falling back to the default.
 *
 * @param {string | undefined} color The language color.
 * @returns {string} A valid color string.
 */
export const resolveLangColor = (color) => color || DEFAULT_LANG_COLOR;
