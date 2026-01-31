/**
 * Delay between HTTP requests in milliseconds.
 * Set this to be polite to the City of Madison servers.
 * Can be overridden via REQUEST_DELAY_MS environment variable.
 */
export const REQUEST_DELAY_MS = parseInt(
  process.env.REQUEST_DELAY_MS || '200',
  10,
);

/**
 * CSS Selectors for parsing the blog list pages.
 * Based on: https://github.com/Programming-with-AI/Civic-Hacking-Alder-Aggregator-Overview/blob/main/SCRAPING_INFO.md
 */
export const SELECTORS = {
  /** Container for the list of posts */
  POST_LIST: '#block-city-front-content .content-blog-summary .cards',
  /** Individual post items (li elements within the cards container) */
  POST_ITEM: '#block-city-front-content .content-blog-summary .cards li',
  /** Post title link (relative to post item) */
  POST_TITLE: '.article-title a',
  /** Post date element (relative to post item) */
  POST_DATE: 'time .datetime',
  /** Post body preview (relative to post item) */
  POST_PREVIEW: '.article-content',
  /** Last page link for pagination */
  LAST_PAGE_LINK: '#block-city-front-content nav.pager .pager__item--last a',
} as const;
