import { describe, expect, it } from 'vitest';
import { parseListPage } from '../parseListPage';
import { Alder } from '../types';

const MOCK_ALDER: Alder = {
  district: 1,
  name: 'Test Alder',
  blogUrl: 'https://www.cityofmadison.com/council/district1/blog',
  photoUrl: '',
};

describe('parseListPage', () => {
  it('extracts posts from list HTML', () => {
    const html = `
      <div id="block-city-front-content">
        <div class="content-blog-summary">
          <ul class="cards">
            <li>
              <div class="article-title">
                <a href="/council/district1/blog/post-1">Post One</a>
              </div>
              <time>
                <span class="datetime" datetime="2024-01-01T10:00:00-06:00"></span>
              </time>
            </li>
          </ul>
        </div>
      </div>
    `;

    const { posts } = parseListPage(html, MOCK_ALDER);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Post One');
    expect(posts[0].url).toBe('https://www.cityofmadison.com/council/district1/blog/post-1');
    expect(posts[0].alderDistrict).toBe(1);
    expect(posts[0].alderName).toBe('Test Alder');
  });
});

