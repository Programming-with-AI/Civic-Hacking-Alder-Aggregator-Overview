/**
 * Represents a Madison Common Council Alder
 */
export interface Alder {
  district: number;
  name: string;
  blogUrl: string;
  photoUrl: string;
}

/**
 * A single blog post extracted from an Alder's blog
 */
export interface BlogPost {
  /** The Alder's district number (1-20) */
  alderDistrict: number;
  /** The Alder's name */
  alderName: string;
  /** Post title */
  title: string;
  /** Permalink URL to the original post */
  url: string;
  /** ISO 8601 timestamp of when the post was published */
  publishedAt: string;
  /** Optional short preview/summary from the list view */
  preview?: string;
}

/**
 * Result from parsing a blog list page
 */
export interface ParsedListPage {
  /** Posts found on this page */
  posts: BlogPost[];
  /** The last page index for pagination (if detected) */
  lastPageIndex: number | null;
}
