## Madison Alder Live Build – Prompt Script

This file is your **prompt script** for the live event. You’ll paste or adapt these prompts into Cursor as you go.

---

## Stage 0 – Context & Foundations (once at the beginning)

**Goal**: Tell Cursor what you’re doing, the tech foundations, and the overall plan for the session.

**Prompt (paste into Cursor):**

```markdown
You are my pair-programmer for a live-coding session.

High-level goal:
- Build a small blog-aggregation pipeline and static site that surfaces posts from City of Madison Alders.

Overall plan:
1. Build a TypeScript-based scraper that fetches multiple Alder blog pages, extracts posts via CSS selectors, and outputs a JSON file.
2. Build a small static site (also in TypeScript) that reads that JSON and renders an aggregated feed.
3. Move the scraper into a GitHub Action that runs on a schedule (cron) and on manual trigger, regenerating the JSON and static site.
4. Stretch goal: expose the aggregated data as an RSS endpoint/feed that RSS readers can consume.

Technical foundations:
- Language: TypeScript everywhere (scraper, static site, and any utilities).
- Linting: ESLint with the Airbnb TypeScript style guide (plus any minimal tweaks needed for DX).
- Testing: set up unit tests early (as soon as we have our first fetch/scraper logic); keep adding tests as we go to guard against regressions.
- Output: a static site that aggregates Alder blog posts plus (if time allows) an RSS feed endpoint.

Reference documents:
- App description / product context (source of truth for features and behavior): `https://github.com/Programming-with-AI/Civic-Hacking-Alder-Aggregator-Overview/blob/main/SHORT_DESCRIPTION.md`
- Scraper configuration (Alder URLs + CSS selectors and metadata): `https://github.com/Programming-with-AI/Civic-Hacking-Alder-Aggregator-Overview/blob/main/SCRAPING_INFO.md`

Collaboration rules:
- Be concise and action-oriented.
- If you need assumptions, make them and state them; don’t block on questions.
- Prefer small, shippable increments per step.
- After any non-trivial code change, briefly explain what changed in 2–3 sentences max.
- Proactively suggest where to add or update unit tests whenever we touch scraping logic, data transformation, or rendering.
```

---

## Stage 1 – Initial Scraper for Alder Blogs

**Goal**: Build the first TypeScript scraper that discovers all Alder blog posts, using the provided scraping info.

**Prompt (adapt/paste when ready):**

```markdown
Let’s implement the initial scraper for the Madison Common Council Alder blogs.

Use these reference docs as the source of truth:
- App description / context: `https://github.com/Programming-with-AI/Civic-Hacking-Alder-Aggregator-Overview/blob/main/SHORT_DESCRIPTION.md`
- Scraper configuration (URLs + CSS selectors + alder list): `https://github.com/Programming-with-AI/Civic-Hacking-Alder-Aggregator-Overview/blob/main/SCRAPING_INFO.md`

Requirements:
- Create a TypeScript script (Node-based) that:
  - Reads the list of Alder blog URLs from the scraping info (we can hard-code them into a config file for now, based on that doc).
  - For each Alder blog:
    - Fetches the blog list pages (starting at `?page=0` and using the pagination selectors described in the scraping info).
    - Extracts **all blog posts** from the list view.
  - For each blog post, capture **only lightweight metadata**, not the full body:
    - Required fields: post title, permalink URL, published datetime, alder district, and alder name.
    - Optional: a very short preview/summary if it’s trivial to extract from the list view, but **do not** crawl individual post pages for full content in this stage.
  - Aggregates results into an in-memory list for now (we’ll write to JSON in a later step if needed).
- Implement a **small delay between requests** (e.g. a configurable `sleep` between HTTP calls) to avoid hammering the City of Madison servers.
  - The delay should be easy to change (e.g. a constant or environment variable), and applied between page requests and/or between different alder sites.

Implementation preferences:
- Use clear, strongly-typed data models for:
  - A single Alder (district, name, blog URL, photo URL).
  - A single BlogPost (including which Alder it came from).
- Keep the main scraping logic separated from I/O (HTTP fetching and logging) so it’s easy to test.
- Add the initial unit test setup (test runner + basic config) and write at least a couple of **small tests** around:
  - Any helper functions you create for pagination.
  - Any HTML parsing logic that can be tested with sample HTML snippets instead of real network calls.

Developer-facing behavior:
- Log progress in a human-readable way (e.g. “Scraping district 3… page 0/5…”).
- Handle errors gracefully: if one Alder or page fails, log it and continue with the rest.
```

Notes for you (Madison):
- Before pasting this, verbally explain to the audience that Stage 1 is “build the core scraper, not yet the JSON history or static site.”
- If time is tight, you can explicitly tell Cursor to mock HTML responses for tests instead of hitting the live site in tests.

---

## Stage 2 – Static Site from Scraped JSON

**Goal**: Build a simple, professional-looking static site that reads the scraper’s JSON output and renders an aggregated feed of links.

**Prompt (adapt/paste when ready):**

```markdown
Now let’s build the static site that consumes the scraper’s output.

Assumption:
- By this point we have a script that can produce a JSON file of posts (one entry per blog post, with title, permalink, published datetime, alder district, alder name).

Requirements:
- Implement a static site that:
  - Reads the scraper’s JSON output at build time (or on page load, if you prefer a pure client-side approach).
  - Renders a single-page “Alder Blog Aggregator” UI that shows:
    - Post title (as a link to the original blog post).
    - Alder name and district.
    - Published date (ideally both absolute and a human-friendly “time ago”).
  - Supports basic pagination over the full list of posts (can be client-side pagination; doesn’t need multiple HTML files).
- Tech choices:
  - You may use either:
    - A simple static HTML/CSS/JavaScript setup, **or**
    - A minimal Next.js app configured for static export.
  - Use Tailwind CSS for styling.
  - Respect the user’s system theme (light/dark) using `prefers-color-scheme` and Tailwind’s dark mode support.

Design/UX:
- Aim for a clean, professional, modern look—no need for flashy or gimmicky design.
- Make the layout responsive so it works well on mobile and desktop.
- Include a simple header that explains what the site is (“Madison Alder Blog Aggregator”) and briefly what the user is seeing.
- If an RSS feed is available (from Stage 4), surface it clearly on the page with a small “Subscribe via RSS” link or badge.

Implementation preferences:
- Keep the data-loading logic clearly separated from the presentational components.
- Add or update unit tests around:
  - Any data transformation layer that adapts the raw scraper JSON to the shape the UI consumes.
  - Any utility functions used for pagination or date formatting.
```

---

## Stage 3 – Scheduling, GitHub Actions, and Incremental Updates

**Goal**: Wire the scraper and static site into a repeatable pipeline: local dev scripts, GitHub Action on schedule and on push, and incremental scraping that stops when it sees already-known posts.

**Prompt (adapt/paste when ready):**

```markdown
Now let’s turn this into an automated pipeline.

Requirements:
- Local scripts:
  - Add an npm script to start the static site locally (e.g. `npm run dev` or similar) so I can demo on `http://localhost:...`.
  - Add an npm script to run the scraper end-to-end (e.g. `npm run scrape`) that:
    - Fetches new posts.
    - Updates the JSON output used by the static site.
- Incremental scraping / caching:
  - Implement a simple persistence mechanism so the scraper:
    - Keeps track of posts it has **already seen** (e.g. via a JSON file committed to the repo).
    - When run, starts from the newest posts and **stops** for a given Alder once it encounters posts that already exist in the stored dataset.
  - This should avoid re-scraping deep history every time, while still capturing genuinely new posts.
- GitHub Actions:
  - Create a GitHub Action workflow that:
    - Runs on:
      - A daily schedule (cron).
      - On pushes to the main branch.
    - Steps:
      1. Check out the repo.
      2. Install dependencies.
      3. Run the scraper script to update data.
      4. Build the static site.
      5. (Optional depending on time) Deploy to GitHub Pages or similar static hosting.

Implementation preferences:
- Keep the caching logic straightforward and well-documented (e.g. comments in code about when the scraper stops for an Alder).
- Make sure unit tests cover:
  - The logic that decides when to stop scraping older pages based on already-known posts.
  - Any helper that reads/writes the cached JSON of previously seen posts.
```

---

## Stage 4 – RSS Feed (Use if Time Allows)

**Goal**: Expose the aggregated Alder posts as a standard RSS feed that RSS readers can subscribe to.

**Presenter note**: Before starting this stage, **pause and check how much time is left**. If things are tight, skip this section.

**Prompt (adapt/paste when ready):**

```markdown
If we have time, let’s add an RSS feed.

Requirements:
- Using the same aggregated data the static site uses, create an RSS feed endpoint or file that:
  - Conforms to a common RSS 2.0 format.
  - Includes items for recent posts with:
    - Title.
    - Link to the original Alder blog post.
    - Publication date.
    - A short description/summary if available (optional).
- Make the RSS URL clearly discoverable (e.g. link tag in the HTML head and/or a visible link on the page).

Implementation options:
- Generate a static `feed.xml` at build/scrape time (preferred for simplicity).
- Or, if the framework makes it trivial, expose a serverless/edge route that returns RSS XML.

Testing / validation:
- Add small tests for the function that maps internal post data to RSS items.
- Do a quick manual validation using an RSS reader or an online RSS validator if possible.
```

---

## Notes & Backups

- If anything goes sideways, you can always say: “Let’s simplify” and ask Cursor:

```markdown
Given the current state of the repo, propose the **simplest** path to a working, demo-able version of the blog aggregator in the next 10–15 minutes, and then implement that plan.
```

- You can tweak any of these prompts on the fly; they’re starting points, not scripts.

---

## Dry Run – Lessons Learned

These are notes from a full rehearsal using the `run-1` folder. You can mention them out loud or just keep them in mind as guardrails.

- **Scraper delay tuning**: A 750ms delay between requests felt too slow for the live demo; 200ms was a good balance between being polite to the city’s servers and keeping things moving. If the site feels sluggish or the network is flaky, feel free to nudge this constant up or down.
- **Keep the stack boring**: Node 20’s built-in `fetch` works fine—no need for `node-fetch`. This keeps dependencies lighter and avoids TypeScript type issues. If you see TS complaining about `fetch`, make sure the `lib` option in `tsconfig.json` includes `DOM`.
- **Directory creation gotchas**: Remember that `public/` needs to exist before copying JSON into it. Using `mkdir -p public && cp ...` in the `build:site` script avoids “No such file or directory” surprises on stage.
- **End-to-end commands to demo**:
  - From `run-1/`: `npm run scrape` to show data fetching.
  - Then `npm run build:site` (or `npm run build` for scraper + site + RSS).
  - Then `npm run dev` and open the printed localhost URL.
- **If time is tight**: You can skip the GitHub Action and/or RSS stage and still have a compelling story with the scraper + static site alone.

