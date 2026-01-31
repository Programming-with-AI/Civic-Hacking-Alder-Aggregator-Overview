import { describe, expect, it } from 'vitest';
import { buildRssXml } from '../generateFeed';
import { AlderPost } from '../../scraper/types';

describe('buildRssXml', () => {
  it('includes basic item fields for posts', () => {
    const posts: AlderPost[] = [
      {
        alderDistrict: 1,
        alderName: 'Test Alder',
        title: 'Test Post',
        url: 'https://example.com/post-1',
        publishedAt: '2024-01-01T10:00:00Z',
      },
    ];

    const xml = buildRssXml(posts, 'https://aggregator.example.com');

    expect(xml).toContain('<rss');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<title>Test Post</title>');
    expect(xml).toContain('<link>https://example.com/post-1</link>');
    expect(xml).toContain(
      '<description>Post by District 1 Alder Test Alder.</description>',
    );
  });
});

