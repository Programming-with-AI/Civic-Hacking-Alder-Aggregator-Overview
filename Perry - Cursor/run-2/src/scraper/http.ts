import { REQUEST_DELAY_MS } from './constants.js';

/**
 * Sleep for the specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Fetch HTML content from a URL with a polite delay.
 * The delay is applied BEFORE the request to avoid hammering the server.
 *
 * @param url - The URL to fetch
 * @param delayMs - Optional override for delay (defaults to REQUEST_DELAY_MS)
 * @returns The HTML content as a string
 * @throws Error if the request fails
 */
export async function fetchHtml(
  url: string,
  delayMs: number = REQUEST_DELAY_MS,
): Promise<string> {
  // Apply delay before request
  if (delayMs > 0) {
    await sleep(delayMs);
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MadisonAlderBlogAggregator/1.0 (civic project)',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  return response.text();
}
