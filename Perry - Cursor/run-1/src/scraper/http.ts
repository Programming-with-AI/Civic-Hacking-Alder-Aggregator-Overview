import { REQUEST_DELAY_MS } from './constants';

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchHtml(url: string): Promise<string> {
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  await sleep(REQUEST_DELAY_MS);
  return html;
}

