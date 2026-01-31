import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { AlderPost } from '../scraper/types';

interface PostsFile {
  posts: AlderPost[];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(iso: string): string {
  const date = new Date(iso);
  // Fall back to now if invalid
  if (Number.isNaN(date.getTime())) {
    return new Date().toUTCString();
  }
  return date.toUTCString();
}

export function buildRssXml(posts: AlderPost[], siteBaseUrl: string): string {
  const channelTitle = 'Madison Alder Blog Aggregator';
  const channelLink = siteBaseUrl;
  const channelDescription =
    'Recent posts from Madison Common Council Alder blogs, aggregated from the official city website.';

  const limitedPosts = posts.slice(0, 100); // keep feed reasonably small

  const itemsXml = limitedPosts
    .map((post) => {
      const title = escapeXml(post.title);
      const link = escapeXml(post.url);
      const guid = escapeXml(post.url);
      const pubDate = toRfc822(post.publishedAt);
      const description = escapeXml(
        `Post by District ${post.alderDistrict} Alder ${post.alderName}.`,
      );

      return [
        '<item>',
        `<title>${title}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${guid}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        `<description>${description}</description>`,
        '</item>',
      ].join('');
    })
    .join('');

  const lastBuildDate =
    limitedPosts.length > 0
      ? toRfc822(limitedPosts[0].publishedAt)
      : new Date().toUTCString();

  const rss = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `<title>${escapeXml(channelTitle)}</title>`,
    `<link>${escapeXml(channelLink)}</link>`,
    `<description>${escapeXml(channelDescription)}</description>`,
    `<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    itemsXml,
    '</channel>',
    '</rss>',
  ].join('');

  return rss;
}

function main() {
  const dataPath = join(__dirname, '..', '..', 'data', 'posts.json');
  const publicDir = join(__dirname, '..', '..', 'public');
  const feedPath = join(publicDir, 'feed.xml');

  if (!existsSync(dataPath)) {
    throw new Error(`posts.json not found at ${dataPath}. Run the scraper first.`);
  }

  const raw = readFileSync(dataPath, 'utf8');
  const parsed = JSON.parse(raw) as PostsFile;
  const posts = Array.isArray(parsed.posts) ? parsed.posts : [];

  // Newest first
  posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const siteBaseUrl =
    process.env.SITE_BASE_URL ?? 'https://example.com'; // override in CI if desired

  const rssXml = buildRssXml(posts, siteBaseUrl);

  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  writeFileSync(feedPath, rssXml, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`RSS feed written to ${feedPath}`);
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    main();
  })();
}

