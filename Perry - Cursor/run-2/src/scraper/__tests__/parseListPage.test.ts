import { describe, it, expect } from 'vitest';
import { parseListPage, extractPageNumber } from '../parseListPage.js';
import { Alder } from '../types.js';

const mockAlder: Alder = {
  district: 4,
  name: 'Michael E. Verveer',
  blogUrl: 'https://www.cityofmadison.com/council/district4/blog',
  photoUrl: 'https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district4.jpg',
};

describe('extractPageNumber', () => {
  it('extracts page number from href with page parameter', () => {
    expect(extractPageNumber('/council/district4/blog?page=5')).toBe(5);
    expect(extractPageNumber('/council/district4/blog?page=0')).toBe(0);
    expect(extractPageNumber('/council/district4/blog?page=42')).toBe(42);
  });

  it('handles href with multiple parameters', () => {
    expect(extractPageNumber('/council/district4/blog?foo=bar&page=3')).toBe(3);
  });

  it('returns null for missing or invalid href', () => {
    expect(extractPageNumber(undefined)).toBeNull();
    expect(extractPageNumber('')).toBeNull();
    expect(extractPageNumber('/council/district4/blog')).toBeNull();
  });
});

describe('parseListPage', () => {
  it('parses a single blog post from HTML', () => {
    const html = `
      <html>
        <body>
          <div id="block-city-front-content">
            <div class="content-blog-summary">
              <ul class="cards">
                <li>
                  <h3 class="article-title">
                    <a href="/council/district4/blog/test-post">Test Post Title</a>
                  </h3>
                  <time>
                    <span class="datetime" datetime="2024-01-15T10:30:00-06:00">January 15, 2024</span>
                  </time>
                  <div class="article-content">This is a preview of the post content.</div>
                </li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = parseListPage(html, mockAlder);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]).toEqual({
      alderDistrict: 4,
      alderName: 'Michael E. Verveer',
      title: 'Test Post Title',
      url: 'https://www.cityofmadison.com/council/district4/blog/test-post',
      publishedAt: '2024-01-15T10:30:00-06:00',
      preview: 'This is a preview of the post content.',
    });
    expect(result.lastPageIndex).toBeNull();
  });

  it('parses multiple posts from HTML', () => {
    const html = `
      <html>
        <body>
          <div id="block-city-front-content">
            <div class="content-blog-summary">
              <ul class="cards">
                <li>
                  <h3 class="article-title"><a href="/post1">Post One</a></h3>
                  <time><span class="datetime" datetime="2024-01-20">Jan 20</span></time>
                </li>
                <li>
                  <h3 class="article-title"><a href="/post2">Post Two</a></h3>
                  <time><span class="datetime" datetime="2024-01-19">Jan 19</span></time>
                </li>
                <li>
                  <h3 class="article-title"><a href="/post3">Post Three</a></h3>
                  <time><span class="datetime" datetime="2024-01-18">Jan 18</span></time>
                </li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = parseListPage(html, mockAlder);

    expect(result.posts).toHaveLength(3);
    expect(result.posts[0].title).toBe('Post One');
    expect(result.posts[1].title).toBe('Post Two');
    expect(result.posts[2].title).toBe('Post Three');
  });

  it('extracts last page index from pagination', () => {
    const html = `
      <html>
        <body>
          <div id="block-city-front-content">
            <div class="content-blog-summary">
              <ul class="cards">
                <li>
                  <h3 class="article-title"><a href="/post1">Post</a></h3>
                  <time><span class="datetime" datetime="2024-01-20">Jan 20</span></time>
                </li>
              </ul>
            </div>
            <nav class="pager">
              <ul>
                <li class="pager__item--last">
                  <a href="/council/district4/blog?page=7">Last</a>
                </li>
              </ul>
            </nav>
          </div>
        </body>
      </html>
    `;

    const result = parseListPage(html, mockAlder);

    expect(result.lastPageIndex).toBe(7);
  });

  it('returns empty posts array for page with no posts', () => {
    const html = `
      <html>
        <body>
          <div id="block-city-front-content">
            <div class="content-blog-summary">
              <ul class="cards"></ul>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = parseListPage(html, mockAlder);

    expect(result.posts).toHaveLength(0);
  });

  it('skips posts without title or URL', () => {
    const html = `
      <html>
        <body>
          <div id="block-city-front-content">
            <div class="content-blog-summary">
              <ul class="cards">
                <li>
                  <h3 class="article-title"><a href="">No Title</a></h3>
                </li>
                <li>
                  <h3 class="article-title"><a href="/valid">Valid Post</a></h3>
                  <time><span class="datetime" datetime="2024-01-20">Jan 20</span></time>
                </li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = parseListPage(html, mockAlder);

    // Should only have the valid post
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('Valid Post');
  });

  it('handles absolute URLs in post links', () => {
    const html = `
      <html>
        <body>
          <div id="block-city-front-content">
            <div class="content-blog-summary">
              <ul class="cards">
                <li>
                  <h3 class="article-title">
                    <a href="https://example.com/external-post">External Post</a>
                  </h3>
                  <time><span class="datetime" datetime="2024-01-20">Jan 20</span></time>
                </li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = parseListPage(html, mockAlder);

    expect(result.posts[0].url).toBe('https://example.com/external-post');
  });
});
