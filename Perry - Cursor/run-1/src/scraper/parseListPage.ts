import * as cheerio from 'cheerio';
import { Alder, AlderPost } from './types';
import { SELECTORS } from './constants';

export interface ListPageParseResult {
  posts: AlderPost[];
  lastPageIndex: number | null;
}

function parsePageParam(href: string | undefined | null): number | null {
  if (!href) return null;
  try {
    const url = new URL(href, 'https://www.cityofmadison.com');
    const pageParam = url.searchParams.get('page');
    if (pageParam == null) {
      return null;
    }
    const pageNum = Number.parseInt(pageParam, 10);
    return Number.isNaN(pageNum) ? null : pageNum;
  } catch (e) {
    return null;
  }
}

export function parseListPage(html: string, alder: Alder): ListPageParseResult {
  const $ = cheerio.load(html);
  const posts: AlderPost[] = [];

  const postsList = $(SELECTORS.list.postsList);
  postsList.find(SELECTORS.list.postItem).each((_, li) => {
    const titleAnchor = $(li).find(SELECTORS.list.titleLink).first();
    const title = titleAnchor.text().trim();
    const href = titleAnchor.attr('href');

    const dateEl = $(li).find(SELECTORS.list.dateTime).first();
    const datetimeAttr = dateEl.attr('datetime') ?? dateEl.text();
    const publishedAt = datetimeAttr ? new Date(datetimeAttr).toISOString() : new Date().toISOString();

    if (!title || !href) {
      return;
    }

    const url = href.startsWith('http')
      ? href
      : new URL(href, alder.blogUrl).toString();

    posts.push({
      alderDistrict: alder.district,
      alderName: alder.name,
      title,
      url,
      publishedAt,
    });
  });

  // Determine last page index for pagination
  let lastPageIndex: number | null = null;
  const lastPageLinkEl = $(SELECTORS.list.lastPageLink).first();
  if (lastPageLinkEl.length > 0) {
    const href = lastPageLinkEl.attr('href');
    lastPageIndex = parsePageParam(href);
  } else {
    // Fallback: try current page + count of pager items
    const currentEl = $(SELECTORS.list.currentPage).first();
    const currentPage = parsePageParam(currentEl.attr('href')) ?? 0;
    const pagerItems = $(SELECTORS.list.paginationItem).length;
    if (pagerItems > 0) {
      lastPageIndex = currentPage + pagerItems - 1;
    }
  }

  return { posts, lastPageIndex };
}

