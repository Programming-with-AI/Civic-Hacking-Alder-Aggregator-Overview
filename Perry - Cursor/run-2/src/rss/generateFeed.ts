import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const PUBLIC_DIR = join(__dirname, '..', '..', 'public');
const POSTS_JSON_PATH = join(DATA_DIR, 'posts.json');
const FEED_XML_PATH = join(PUBLIC_DIR, 'feed.xml');

interface BlogPost {
  alderDistrict: number;
  alderName: string;
  title: string;
  url: string;
  publishedAt: string;
  preview?: string;
}

interface PostsData {
  posts: BlogPost[];
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format a date as RFC 822 (required by RSS)
 */
function toRfc822(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

/**
 * Generate an RSS item from a blog post
 */
function generateItem(post: BlogPost): string {
  const description = post.preview
    ? escapeXml(post.preview)
    : `Blog post from District ${post.alderDistrict} Alder ${escapeXml(post.alderName)}`;

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <description>${description}</description>
      <author>District ${post.alderDistrict} - ${escapeXml(post.alderName)}</author>
    </item>`;
}

/**
 * Generate the full RSS feed XML
 */
function generateFeed(posts: BlogPost[]): string {
  const now = new Date().toUTCString();
  
  // Limit to most recent 100 posts for feed
  const feedPosts = posts.slice(0, 100);
  const items = feedPosts.map(generateItem).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Madison Alder Blog Aggregator</title>
    <link>https://example.com</link>
    <description>Aggregated blog posts from all 20 Madison Common Council Alders</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://example.com/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

/**
 * Main function to generate RSS feed
 */
function main() {
  console.log('Generating RSS feed...');

  // Load posts
  if (!existsSync(POSTS_JSON_PATH)) {
    console.error('Error: posts.json not found. Run scraper first.');
    process.exitCode = 1;
    return;
  }

  const raw = readFileSync(POSTS_JSON_PATH, 'utf8');
  const data: PostsData = JSON.parse(raw);

  if (!data.posts || data.posts.length === 0) {
    console.error('Error: No posts found in posts.json');
    process.exitCode = 1;
    return;
  }

  console.log(`Found ${data.posts.length} posts`);

  // Generate feed
  const feedXml = generateFeed(data.posts);

  // Ensure public directory exists
  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Write feed
  writeFileSync(FEED_XML_PATH, feedXml, 'utf8');
  console.log(`RSS feed written to ${FEED_XML_PATH}`);
  console.log(`Feed contains ${Math.min(data.posts.length, 100)} items`);
}

main();
