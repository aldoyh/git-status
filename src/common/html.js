// @ts-check

/**
 * @file HTML/SVG encoding utilities.
 *
 * These functions sanitize user-provided strings before embedding them
 * into SVG markup, preventing XSS and markup injection.
 */

/**
 * Encode string for safe embedding in HTML/SVG.
 *
 * Escapes HTML special characters and non-ASCII characters to their
 * numeric entity equivalents, and strips control characters that could
 * interfere with SVG rendering.
 *
 * @see https://stackoverflow.com/a/48073476/10629172
 *
 * @param {string} str String to encode.
 * @returns {string} Encoded string safe for SVG embedding.
 */
const encodeHTML = (str) => {
  return str
    .replace(/[\u00A0-\u9999<>&"'](?!#)/gim, (i) => {
      return "&#" + i.charCodeAt(0) + ";";
    })
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
};

export { encodeHTML };
