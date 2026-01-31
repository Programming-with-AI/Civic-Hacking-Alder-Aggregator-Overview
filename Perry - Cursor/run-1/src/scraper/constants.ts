// Delay between HTTP requests, in milliseconds.
// Tuned down after a dry run from 750ms to 200ms
// to keep the scraper polite but faster for the live demo.
export const REQUEST_DELAY_MS = 200;

export const SELECTORS = {
  list: {
    postsList: '#block-city-front-content .content-blog-summary .cards',
    postItem: 'li',
    titleLink: '.article-title a',
    dateTime: 'time .datetime',
    // Optional preview from list view
    preview: '.article-content',
    paginationList: '#block-city-front-content nav.pager ul',
    paginationItem: '#block-city-front-content nav.pager ul > li[class="pager__item"]',
    paginationLink: '#block-city-front-content nav.pager ul li:nth-child(X) a',
    lastPageLink: '#block-city-front-content nav.pager .pager__item--last a',
    currentPage: '#block-city-front-content nav.pager [aria-current]',
  },
};

