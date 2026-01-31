import { ALDERS } from './alders';
import { fetchHtml } from './http';
import { parseListPage } from './parseListPage';
import { AlderPost } from './types';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface CacheData {
  posts: AlderPost[];
}

const DATA_DIR = join(__dirname, '..', '..', 'data');
const POSTS_JSON_PATH = join(DATA_DIR, 'posts.json');

function loadCache(): CacheData {
  if (!existsSync(POSTS_JSON_PATH)) {
    return { posts: [] };
  }
  const raw = readFileSync(POSTS_JSON_PATH, 'utf8');
  const parsed = JSON.parse(raw) as CacheData;
  return parsed;
}

function saveCache(cache: CacheData): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(POSTS_JSON_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

function buildKnownUrlsSet(cache: CacheData): Set<string> {
  return new Set(cache.posts.map((p) => p.url));
}

async function scrapeAlder(alderIndex: number, cache: CacheData, knownUrls: Set<string>): Promise<AlderPost[]> {
  const alder = ALDERS[alderIndex];
  console.log(`\n=== Scraping district ${alder.district} – ${alder.name} ===`);

  const allNewPosts: AlderPost[] = [];
  let page = 0;
  let lastPageIndex: number | null = null;
  let shouldStopForAlder = false;

  // We iterate pages until we either hit lastPageIndex or encounter only known posts.
  while (!shouldStopForAlder) {
    const url = `${alder.blogUrl}?page=${page}`;
    const html = await fetchHtml(url);
    const { posts, lastPageIndex: detectedLast } = parseListPage(html, alder);

    if (lastPageIndex == null && detectedLast != null) {
      lastPageIndex = detectedLast;
    }

    console.log(`Page ${page}: found ${posts.length} posts`);

    if (posts.length === 0) {
      break;
    }

    const newPostsOnPage: AlderPost[] = [];
    let encounteredKnown = false;

    // Posts are newest-first on page; stop as soon as we see a known one
    // to avoid going further back in time than necessary.
    for (const post of posts) {
      if (knownUrls.has(post.url)) {
        encounteredKnown = true;
        break;
      }
      newPostsOnPage.push(post);
    }

    if (newPostsOnPage.length > 0) {
      console.log(`Page ${page}: ${newPostsOnPage.length} new posts`);
      allNewPosts.push(...newPostsOnPage);
    }

    if (encounteredKnown) {
      console.log(`Encountered previously-seen posts for district ${alder.district}; stopping further pagination.`);
      shouldStopForAlder = true;
      break;
    }

    if (lastPageIndex != null && page >= lastPageIndex) {
      break;
    }

    page += 1;
  }

  return allNewPosts;
}

async function main() {
  const cache = loadCache();
  const knownUrls = buildKnownUrlsSet(cache);

  const allNewPosts: AlderPost[] = [];

  for (let i = 0; i < ALDERS.length; i += 1) {
    try {
      const alderNewPosts = await scrapeAlder(i, cache, knownUrls);
      allNewPosts.push(...alderNewPosts);
      alderNewPosts.forEach((p) => knownUrls.add(p.url));
    } catch (err) {
      console.error(`Error while scraping Alder index ${i}:`, err);
    }
  }

  if (allNewPosts.length === 0) {
    console.log('No new posts found.');
    return;
  }

  console.log(`\nFound ${allNewPosts.length} new posts total.`);

  const updatedPosts = [...cache.posts, ...allNewPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  saveCache({ posts: updatedPosts });
  console.log(`Updated cache written to ${POSTS_JSON_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error in scraper:', err);
  process.exitCode = 1;
});

