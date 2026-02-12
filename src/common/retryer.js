// @ts-check

import { CustomError } from "./error.js";
import { logger } from "./log.js";

// Count the number of GitHub API tokens available.
const PATs = Object.keys(process.env).filter((key) =>
  /PAT_\d*$/.exec(key),
).length;
const RETRIES = process.env.NODE_ENV === "test" ? 7 : PATs;

/**
 * Base delay for exponential backoff in milliseconds.
 */
const BASE_DELAY_MS = 300;

/**
 * @typedef {import("axios").AxiosResponse} AxiosResponse Axios response.
 * @typedef {(variables: any, token: string, retriesForTests?: number) => Promise<AxiosResponse>} FetcherFunction Fetcher function.
 */

/**
 * Whether to skip backoff delays (enabled in test environment).
 */
const SKIP_BACKOFF = process.env.NODE_ENV === "test";

/**
 * Sleep for a given number of milliseconds.
 * No-op in test environment to keep tests fast.
 *
 * @param {number} ms Milliseconds to sleep.
 * @returns {Promise<void>} Resolves after the delay.
 */
const sleep = (ms) =>
  SKIP_BACKOFF
    ? Promise.resolve()
    : new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter.
 *
 * @param {number} retryAttempt The current retry attempt (0-indexed).
 * @returns {number} Delay in milliseconds.
 */
const calculateBackoff = (retryAttempt) => {
  const exponentialDelay = BASE_DELAY_MS * Math.pow(2, retryAttempt);
  // Add random jitter (0-50% of the delay) to avoid thundering herd.
  const jitter = exponentialDelay * Math.random() * 0.5;
  return Math.min(exponentialDelay + jitter, 10000); // Cap at 10s.
};

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * Uses exponential backoff with jitter between retries to avoid overwhelming
 * rate-limited APIs. Falls back to the next PAT token on rate-limit or bad credentials.
 *
 * @param {FetcherFunction} fetcher The fetcher function.
 * @param {any} variables Object with arguments to pass to the fetcher function.
 * @param {number} retries How many times to retry (current attempt count).
 * @returns {Promise<any>} The response from the fetcher function.
 */
const retryer = async (fetcher, variables, retries = 0) => {
  if (!RETRIES) {
    throw new CustomError("No GitHub API tokens found", CustomError.NO_TOKENS);
  }

  if (retries > RETRIES) {
    throw new CustomError(
      "Downtime due to GitHub API rate limiting",
      CustomError.MAX_RETRY,
    );
  }

  try {
    // Try to fetch with the current token (RETRIES is 0-indexed so add 1).
    let response = await fetcher(
      variables,
      // @ts-ignore
      process.env[`PAT_${retries + 1}`],
      retries,
    );

    // React on both type and message-based rate-limit signals.
    // https://github.com/anuraghazra/github-readme-stats/issues/4425
    const errors = response?.data?.errors;
    const errorType = errors?.[0]?.type;
    const errorMsg = errors?.[0]?.message || "";
    const isRateLimited =
      (errors && errorType === "RATE_LIMITED") || /rate limit/i.test(errorMsg);

    if (isRateLimited) {
      logger.log(`PAT_${retries + 1} Failed (rate limited)`);
      // Apply exponential backoff before switching to next token.
      await sleep(calculateBackoff(retries));
      return retryer(fetcher, variables, retries + 1);
    }

    return response;
  } catch (err) {
    /** @type {any} */
    const e = err;

    // Network/unexpected error - let caller treat as failure.
    if (!e?.response) {
      throw e;
    }

    const isBadCredential = e?.response?.data?.message === "Bad credentials";
    const isAccountSuspended =
      e?.response?.data?.message === "Sorry. Your account was suspended.";

    if (isBadCredential || isAccountSuspended) {
      logger.log(
        `PAT_${retries + 1} Failed (${isBadCredential ? "bad credentials" : "account suspended"})`,
      );
      // Apply backoff before trying next token.
      await sleep(calculateBackoff(retries));
      return retryer(fetcher, variables, retries + 1);
    }

    // HTTP error with a response - return it for caller-side handling.
    return e.response;
  }
};

export { retryer, RETRIES };
export default retryer;
