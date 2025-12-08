In order to let participants focus on building the business logic of their programs, and not get bogged down in looking for URLs and CSS selectors for the scrapers, we are providing that information for you. Feel free to supplement this information with your own research as necessary. 

I'm starting with `#block-city-front-content` often as an ID that should speed up the selection and limit the ability of new website features that aren't related to the posts themselves from breaking the scraping. 

## Pages
The base URL for Alder blogs is https://www.cityofmadison.com/council/districtXX/blog, where XX is the Alder district, 1 through 20, with no leading zeros. 


## Post List Selectors

> `X` in the `:nth-child(X)` pseudo selectors should be the index of the current post or link. In CSS selectors, the first index is 1, not 0. 

> Pagination is done with adding `?page=X` to the blog list URL, where `X` is the desired page. The total number of pages can be determined with the last page link below. It is safe to start with ?page=0 for the first page, which will return the most recent blog posts.
To iterate over all pages, you can start with ?page=0 and from that, find the last page link content/selector, and note the page parameter, and loop over each page onward from page 0 util the last page. 

| Content | Selector | Notes |
| -------- | -------- | ------ |
| List of posts | `#block-city-front-content .content-blog-summary .cards` | This is a `<ul>`. Each `<li>` is a post. |
| Post Title | `#block-city-front-content .content-blog-summary .cards li:nth-child(X) .article-title a` | The `href` value of this tag is a permalink URL |
| Post Date | `#block-city-front-content .content-blog-summary .cards li:nth-child(X) time .datetime` | The `datetime` attribute on this element will have a timestamp |
| Post Body Preview | `#block-city-front-content .content-blog-summary .cards li:nth-child(X) .article-content` |  |
| Post Categories | `#block-city-front-content .content-blog-summary .cards li:nth-child(X) .card-content > p` | Each `<a>` child is a category. This selector seems particularly fragile. |
| Pagination list | `#block-city-front-content nav.pager ul` |  |
| Pagination list item | `#block-city-front-content nav.pager ul > li[class="pager__item"]` | Some items in the list are previous, next, first, and last links. This selector excludes those. |
| Pagination link | `#block-city-front-content nav.pager ul li:nth-child(X) a` | The `href` attribute is a link to that page in the pagination. |
| Last page link | `#block-city-front-content nav.pager .pager__item--last a` | Inner HTML includes `visually-hidden` spans |
| Current page in post pagination | `#block-city-front-content nav.pager [aria-current]` |  |


## Individual Post Page Selectors

| Content | Selector | Notes |
| -------- | -------- | ------ |
| Title | `#block-city-front-content h1` |  |
| Body | `#block-city-front-content .body` |  |
| Date | `#block-city-front-content .date-posted time` | The `datetime` attribute on this element will have a timestamp | 
| Categories | `#block-city-front-content .field-category-multi .field-multi-item` | Each child `div` is category. One post can belong to multiple categories. |
| Tags | `#block-city-front-content .field-tag-multi .field-multi-item` | Like categories, each child `div` is a tag. |

## Alders

| District | Alder | Blog URL | Photo URL |
| ------- | ----- | ---------- | ---------- |
| 1 | John W. Duncan | https://www.cityofmadison.com/council/district1/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district1.jpg |
| 2 | Will Ochowicz | https://www.cityofmadison.com/council/district2/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district2.jpg |
| 3 | Derek Field | https://www.cityofmadison.com/council/district3/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district3.jpg |
| 4 | Michael E. Verveer | https://www.cityofmadison.com/council/district4/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district4.jpg |
| 5 | Regina M. Vidaver | https://www.cityofmadison.com/council/district5/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district5.jpg |
| 6 | Davy Mayer | https://www.cityofmadison.com/council/district6/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district6.jpg |
| 7 | Badri Lankella | https://www.cityofmadison.com/council/district7/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district7.jpg |
| 8 | MGR Govindarajan | https://www.cityofmadison.com/council/district8/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district8.jpg |
| 9 | Joann Pritchett | https://www.cityofmadison.com/council/district9/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district9.jpg |
| 10 | Yannette Figueroa Cole | https://www.cityofmadison.com/council/district10/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district10.jpg |
| 11 | Bill Tishler | https://www.cityofmadison.com/council/district11/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district11.jpg |
| 12 | Julia Matthews | https://www.cityofmadison.com/council/district12/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district12.jpg |
| 13 | Tag Evers | https://www.cityofmadison.com/council/district13/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district13.jpg |
| 14 | Isadore Knox Jr. | https://www.cityofmadison.com/council/district14/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district14.jpg |
| 15 | Dina Nina Martinez-Rutherford | https://www.cityofmadison.com/council/district15/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district15.jpg |
| 16 | Sean O'Brien | https://www.cityofmadison.com/council/district16/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district16.jpg |
| 17 | Sabrina V. Madison | https://www.cityofmadison.com/council/district17/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district17.jpg |
| 18 | Carmella Glenn | https://www.cityofmadison.com/council/district18/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district18.jpg |
| 19 | John P. Guequierre | https://www.cityofmadison.com/council/district19/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district19.jpg |
| 20 | Barbara Harrington-McKinney | https://www.cityofmadison.com/council/district20/blog | https://www.cityofmadison.com/sites/default/files/styles/portrait_xs_2x/public/council/images/alders/district20.jpg |

