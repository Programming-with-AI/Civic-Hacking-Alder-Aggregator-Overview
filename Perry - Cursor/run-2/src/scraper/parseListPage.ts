import * as cheerio from 'cheerio';
import { Alder, BlogPost, ParsedListPage } from './types.js';
import { SELECTORS } from './constants.js';

/**
 * Extract the last page index from the pagination link href.
 * The href looks like "/council/districtX/blog?page=N"
 *
 * @param href - The href attribute from the last page link
 * @returns The page number, or null if not parseable
 */
export function extractPageNumber(href: string | undefined): number | null {
  if (!href) return null;

  const match = href.match(/[?&]page=(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Parse a blog list page and extract posts and pagination info.
 *
 * @param html - Raw HTML content of the page
 * @param alder - The Alder whose blog this is (for metadata)
 * @returns Parsed posts and pagination information
 */
export function parseListPage(html: string, alder: Alder): ParsedListPage {
  const $ = cheerio.load(html);
  const posts: BlogPost[] = [];

  // Find all post items
  $(SELECTORS.POST_ITEM).each((_, element) => {
    const $post = $(element);

    // Extract title and URL
    const $titleLink = $post.find(SELECTORS.POST_TITLE);
    const title = $titleLink.text().trim();
    const relativeUrl = $titleLink.attr('href');

    if (!title || !relativeUrl) {
      // Skip malformed entries
      return;
    }

    // Build absolute URL
    const url = relativeUrl.startsWith('http')
      ? relativeUrl
      : `https://www.cityofmadison.com${relativeUrl}`;

    // Extract published date
    const $datetime = $post.find(SELECTORS.POST_DATE);
    const datetimeAttr = $datetime.attr('datetime');
    // Fallback to text content if datetime attr is missing
    const publishedAt = datetimeAttr || $datetime.text().trim() || '';

    // Extract preview (optional)
    const preview = $post.find(SELECTORS.POST_PREVIEW).text().trim() || undefined;

    posts.push({
      alderDistrict: alder.district,
      alderName: alder.name,
      title,
      url,
      publishedAt,
      preview,
    });
  });

  // Extract last page index for pagination
  const lastPageHref = $(SELECTORS.LAST_PAGE_LINK).attr('href');
  const lastPageIndex = extractPageNumber(lastPageHref);

  return { posts, lastPageIndex };
}
