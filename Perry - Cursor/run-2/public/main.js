/**
 * Madison Alder Blog Aggregator - Client-side JavaScript
 */

// === Configuration ===
const POSTS_PER_PAGE = 20;

// === State ===
let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
let currentDistrict = '';
let currentSearch = '';

// === DOM Elements ===
const postsContainer = document.getElementById('posts-container');
const paginationContainer = document.getElementById('pagination');
const districtFilter = document.getElementById('district-filter');
const searchInput = document.getElementById('search-input');
const postCountEl = document.getElementById('post-count');

// === Utility Functions ===

/**
 * Format a date string as a human-readable relative time ("2 days ago")
 */
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Format a date string as an absolute date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate text to a maximum length
 */
function truncate(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
}

// === Data Functions ===

/**
 * Load posts from JSON file
 */
async function loadPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Failed to load posts');
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error loading posts:', error);
    return [];
  }
}

/**
 * Get unique districts from posts
 */
function getDistricts(posts) {
  const districts = new Map();
  posts.forEach(post => {
    if (!districts.has(post.alderDistrict)) {
      districts.set(post.alderDistrict, post.alderName);
    }
  });
  return Array.from(districts.entries()).sort((a, b) => a[0] - b[0]);
}

/**
 * Filter posts based on current filters
 */
function filterPosts() {
  filteredPosts = allPosts.filter(post => {
    // District filter
    if (currentDistrict && post.alderDistrict !== parseInt(currentDistrict)) {
      return false;
    }
    // Search filter
    if (currentSearch) {
      const searchLower = currentSearch.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const previewMatch = post.preview?.toLowerCase().includes(searchLower) || false;
      const alderMatch = post.alderName.toLowerCase().includes(searchLower);
      if (!titleMatch && !previewMatch && !alderMatch) {
        return false;
      }
    }
    return true;
  });
  currentPage = 1;
}

// === Rendering Functions ===

/**
 * Render a single post card
 */
function renderPost(post) {
  const relativeTime = timeAgo(post.publishedAt);
  const absoluteDate = formatDate(post.publishedAt);
  
  return `
    <article class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div class="flex flex-col sm:flex-row sm:items-start gap-3">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold mb-1">
            <a href="${escapeHtml(post.url)}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="text-madison-blue dark:text-blue-400 hover:underline">
              ${escapeHtml(post.title)}
            </a>
          </h2>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span class="font-medium">District ${post.alderDistrict}</span>
            <span class="hidden sm:inline">•</span>
            <span>${escapeHtml(post.alderName)}</span>
            <span class="hidden sm:inline">•</span>
            <time datetime="${post.publishedAt}" title="${absoluteDate}">
              ${relativeTime}
            </time>
          </div>
          ${post.preview ? `
            <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              ${escapeHtml(truncate(post.preview, 250))}
            </p>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Render the posts list
 */
function renderPosts() {
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const pagePosts = filteredPosts.slice(startIndex, endIndex);

  if (pagePosts.length === 0) {
    postsContainer.innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <p class="text-lg">No posts found</p>
        <p class="text-sm mt-1">Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  postsContainer.innerHTML = pagePosts.map(renderPost).join('');
}

/**
 * Render pagination controls
 */
function renderPagination() {
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  const buttons = [];
  
  // Previous button
  buttons.push(`
    <button onclick="goToPage(${currentPage - 1})" 
            ${currentPage === 1 ? 'disabled' : ''}
            class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      ← Prev
    </button>
  `);

  // Page numbers
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  pageNumbers.forEach(pageNum => {
    if (pageNum === '...') {
      buttons.push(`<span class="px-2 text-gray-400">…</span>`);
    } else {
      const isActive = pageNum === currentPage;
      buttons.push(`
        <button onclick="goToPage(${pageNum})"
                class="px-3 py-2 rounded-lg border transition-colors
                       ${isActive 
                         ? 'bg-madison-blue dark:bg-madison-gold text-white dark:text-gray-900 border-madison-blue dark:border-madison-gold' 
                         : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}">
          ${pageNum}
        </button>
      `);
    }
  });

  // Next button
  buttons.push(`
    <button onclick="goToPage(${currentPage + 1})" 
            ${currentPage === totalPages ? 'disabled' : ''}
            class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      Next →
    </button>
  `);

  paginationContainer.innerHTML = buttons.join('');
}

/**
 * Get smart page numbers with ellipsis
 */
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

/**
 * Update post count display
 */
function updatePostCount() {
  const showing = Math.min(filteredPosts.length, POSTS_PER_PAGE);
  postCountEl.textContent = `Showing ${filteredPosts.length.toLocaleString()} posts`;
}

/**
 * Populate district filter dropdown
 */
function populateDistrictFilter() {
  const districts = getDistricts(allPosts);
  districts.forEach(([district, name]) => {
    const option = document.createElement('option');
    option.value = district;
    option.textContent = `District ${district} - ${name}`;
    districtFilter.appendChild(option);
  });
}

// === Event Handlers ===

function goToPage(page) {
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPosts();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDistrictChange(event) {
  currentDistrict = event.target.value;
  filterPosts();
  renderPosts();
  renderPagination();
  updatePostCount();
}

function handleSearchInput(event) {
  currentSearch = event.target.value.trim();
  filterPosts();
  renderPosts();
  renderPagination();
  updatePostCount();
}

// Debounce helper for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// === Initialization ===

async function init() {
  // Load posts
  allPosts = await loadPosts();
  filteredPosts = [...allPosts];

  if (allPosts.length === 0) {
    postsContainer.innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <p class="text-lg">No posts available</p>
        <p class="text-sm mt-1">Run the scraper to fetch posts</p>
      </div>
    `;
    return;
  }

  // Setup UI
  populateDistrictFilter();
  updatePostCount();
  renderPosts();
  renderPagination();

  // Setup event listeners
  districtFilter.addEventListener('change', handleDistrictChange);
  searchInput.addEventListener('input', debounce(handleSearchInput, 300));
}

// Make goToPage globally accessible for onclick handlers
window.goToPage = goToPage;

// Start the app
init();
