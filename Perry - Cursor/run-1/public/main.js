const PAGE_SIZE = 20;

/**
 * Very small relative time helper.
 */
function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (Number.isNaN(diffMinutes)) {
    return '';
  }

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mo ago`;

  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears} yr${diffYears === 1 ? '' : 's'} ago`;
}

function formatAbsoluteDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function loadPosts() {
  const res = await fetch('./posts.json');
  if (!res.ok) {
    throw new Error(`Failed to load posts.json: ${res.status}`);
  }
  const data = await res.json();
  // Expect shape: { posts: [...] }
  const posts = Array.isArray(data.posts) ? data.posts : [];
  // Newest first
  posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return posts;
}

function renderPosts(posts, page) {
  const container = document.getElementById('posts');
  const summary = document.getElementById('summary');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const slice = posts.slice(startIndex, endIndex);

  container.innerHTML = '';

  slice.forEach((post) => {
    const li = document.createElement('article');
    li.className =
      'rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-4 py-3 shadow-sm';

    const titleLink = document.createElement('a');
    titleLink.href = post.url;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.textContent = post.title;
    titleLink.className =
      'text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline';

    const meta = document.createElement('div');
    meta.className = 'mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400';

    const alderSpan = document.createElement('span');
    alderSpan.textContent = `District ${post.alderDistrict} • ${post.alderName}`;

    const dateSpan = document.createElement('span');
    const abs = formatAbsoluteDate(post.publishedAt);
    const rel = formatRelativeTime(post.publishedAt);
    dateSpan.textContent = abs && rel ? `${abs} (${rel})` : abs || rel;

    meta.appendChild(alderSpan);
    if (dateSpan.textContent) {
      const dot = document.createElement('span');
      dot.textContent = '•';
      meta.appendChild(dot);
      meta.appendChild(dateSpan);
    }

    li.appendChild(titleLink);
    li.appendChild(meta);
    container.appendChild(li);
  });

  summary.textContent =
    total === 0
      ? 'No posts found yet.'
      : `Showing ${startIndex + 1}–${endIndex} of ${total} posts`;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  // Store current page on buttons so handlers can read it.
  prevBtn.dataset.page = String(currentPage);
  nextBtn.dataset.page = String(currentPage);
}

async function init() {
  const summary = document.getElementById('summary');
  try {
    const posts = await loadPosts();
    let currentPage = 1;
    renderPosts(posts, currentPage);

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    prevBtn.addEventListener('click', () => {
      const current = Number(prevBtn.dataset.page || '1');
      if (current > 1) {
        currentPage = current - 1;
        renderPosts(posts, currentPage);
      }
    });

    nextBtn.addEventListener('click', () => {
      const current = Number(nextBtn.dataset.page || '1');
      const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
      if (current < totalPages) {
        currentPage = current + 1;
        renderPosts(posts, currentPage);
      }
    });
  } catch (err) {
    console.error(err);
    summary.textContent = 'Failed to load posts. Please try again later.';
  }
}

init();

