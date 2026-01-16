# Sample Scraper Output

The output of a hypothetical scraper that collects blog posts from all 20 Madison Common Council alder blogs using a git-scraping approach.
This is only an example and is not the "required" approach, different developers might have different preferences or approaches on how to fetch and store alder posts.
This is merely meant to show one possible output, and is also useful for developers who might want to start with sample data first, and develop the user experience first before building out the backend.

## What it does

As part of the development of this event, we built a test scraper that:
- Fetches blog posts from all 20 alder district blogs
- Stores posts in JSON files tracked in git (git-scraping)
- Handles pagination automatically
- Deduplicates posts on subsequent runs
- Updates `last_seen` timestamps for existing posts
- Tracks scraping history in a log file

We are not providing the example scraper, developers presenting should create their own.

## Output Files

The example scraper creates three JSON files in this `example_data/` directory:

### `example_data/posts.json`
Master file containing all discovered posts with:
- Post ID (hash of URL)
- District number and alder name
- Title, URL, date
- Preview text
- Categories and tags
- Discovery and last-seen timestamps

### `example_data/alders.json`
Metadata about all 20 alders:
- Name, district, blog URL, photo URL
- Last scrape timestamp
- Post count

### `example_data/scrape_log.json`
History of scraping runs:
- Timestamp
- Number of posts discovered/updated
- Errors (if any)
- Duration in seconds

## Results from Full Scrape

**Total posts scraped:** 4,248 posts across all 20 districts  
**Duration:** ~16.5 minutes  
**File size:** 3.0 MB (posts.json)

### Posts by District:
- District 1 (John W. Duncan): 175 posts
- District 2 (Will Ochowicz): 26 posts
- District 3 (Derek Field): 191 posts
- District 19 (John P. Guequierre): 556 posts
- District 20 (Barbara Harrington-McKinney): 229 posts
- *(and many more...)*

## Features

- **Incremental updates**: Only new posts are added; existing posts are updated with new timestamps
- **Deduplication**: Posts are identified by URL hash to prevent duplicates
- **Error resilience**: Continues scraping other districts if one fails
- **Rate limiting**: Polite 1-second delay between requests
- **Comprehensive logging**: Track all scraping activity

## Data Structure

Each post in `posts.json` has the following structure:
```json
{
  "id": "hash-of-url",
  "district": 1,
  "alder_name": "John W. Duncan",
  "url": "https://...",
  "title": "Post Title",
  "date": "2025-01-15T10:30:00-06:00",
  "preview": "First few paragraphs...",
  "categories": ["Transportation", "Budget"],
  "tags": [],
  "discovered_date": "2025-12-13T11:55:49.548189",
  "last_seen": "2025-12-13T11:55:49.548192"
}
```

## License

This is a civic project for aggregating public blog posts from Madison Common Council members.
