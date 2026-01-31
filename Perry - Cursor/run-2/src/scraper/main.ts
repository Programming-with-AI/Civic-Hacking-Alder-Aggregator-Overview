import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ALDERS } from './alders.js';
import { fetchHtml } from './http.js';
import { parseListPage } from './parseListPage.js';
import { Alder, BlogPost } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const POSTS_JSON_PATH = join(DATA_DIR, 'posts.json');

interface PostsCache {
  posts: BlogPost[];
}

/**
 * Load existing posts from cache file.
 */
function loadCache(): PostsCache {
  if (!existsSync(POSTS_JSON_PATH)) {
    return { posts: [] };
  }
  try {
    const raw = readFileSync(POSTS_JSON_PATH, 'utf8');
    return JSON.parse(raw) as PostsCache;
  } catch (err) {
    console.warn('Warning: Could not parse existing cache, starting fresh');
    return { posts: [] };
  }
}

/**
 * Save posts to cache file.
 */
function saveCache(cache: PostsCache): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(POSTS_JSON_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Build a Set of known post URLs for quick lookup.
 */
function buildKnownUrlsSet(cache: PostsCache): Set<string> {
  return new Set(cache.posts.map((p) => p.url));
}

/**
 * Scrape blog posts for a single Alder with incremental support.
 * Stops when it encounters a post that's already in our cache.
 */
async function scrapeAlderIncremental(
  alder: Alder,
  knownUrls: Set<string>,
): Promise<BlogPost[]> {
  console.log(`\n=== Scraping district ${alder.district} – ${alder.name} ===`);

  const newPosts: BlogPost[] = [];
  let page = 0;
  let lastPageIndex: number | null = null;
  let shouldStop = false;

  while (!shouldStop) {
    const url = `${alder.blogUrl}?page=${page}`;
    console.log(`  Fetching page ${page}...`);

    let html: string;
    try {
      html = await fetchHtml(url);
    } catch (err) {
      console.error(`  Error fetching ${url}:`, err);
      break;
    }

    const { posts, lastPageIndex: detectedLast } = parseListPage(html, alder);

    // Update last page index if detected
    if (lastPageIndex === null && detectedLast !== null) {
      lastPageIndex = detectedLast;
      console.log(`  Detected ${lastPageIndex + 1} total pages`);
    }

    if (posts.length === 0) {
      console.log(`  Page ${page}: no posts found`);
      break;
    }

    // Process posts - they come newest first from the page
    // Stop as soon as we see a post we already know about
    let newOnThisPage = 0;
    for (const post of posts) {
      if (knownUrls.has(post.url)) {
        console.log(`  Found known post, stopping pagination for this alder`);
        shouldStop = true;
        break;
      }
      newPosts.push(post);
      newOnThisPage += 1;
    }

    console.log(`  Page ${page}: ${newOnThisPage} new posts`);

    // Check if we've reached the last page
    if (lastPageIndex !== null && page >= lastPageIndex) {
      break;
    }

    page += 1;
  }

  console.log(`  Total new posts for district ${alder.district}: ${newPosts.length}`);
  return newPosts;
}

/**
 * Main scraper entry point with incremental caching support.
 * Only fetches new posts since the last run.
 */
async function main() {
  console.log('Madison Alder Blog Aggregator - Scraper');
  console.log('=======================================\n');

  // Load existing cache
  const cache = loadCache();
  const knownUrls = buildKnownUrlsSet(cache);
  console.log(`Loaded ${cache.posts.length} existing posts from cache`);
  console.log(`Scraping ${ALDERS.length} Alder blogs for new posts...\n`);

  const allNewPosts: BlogPost[] = [];

  for (const alder of ALDERS) {
    try {
      const newPosts = await scrapeAlderIncremental(alder, knownUrls);
      allNewPosts.push(...newPosts);
      // Add to known URLs so we don't duplicate within a single run
      newPosts.forEach((p) => knownUrls.add(p.url));
    } catch (err) {
      console.error(`Error scraping district ${alder.district}:`, err);
      // Continue with other alders
    }
  }

  console.log(`\n=======================================`);

  if (allNewPosts.length === 0) {
    console.log('No new posts found. Cache unchanged.');
    return;
  }

  console.log(`Found ${allNewPosts.length} new posts`);

  // Merge new posts with existing, sort by date (newest first)
  const mergedPosts = [...allNewPosts, ...cache.posts].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });

  // Save updated cache
  saveCache({ posts: mergedPosts });
  console.log(`Updated cache with ${mergedPosts.length} total posts`);
  console.log(`Output written to ${POSTS_JSON_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
