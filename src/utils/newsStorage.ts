import { NewsPost } from '../types';
import { INITIAL_NEWS_POSTS } from '../data/newsData';

const NEWS_STORAGE_KEY = 'meo_news_posts_v1';

export function getNewsPosts(): NewsPost[] {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (!raw) {
      // First time initialization
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(INITIAL_NEWS_POSTS));
      return INITIAL_NEWS_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_NEWS_POSTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load news posts from localStorage', e);
    return INITIAL_NEWS_POSTS;
  }
}

export function saveNewsPosts(posts: NewsPost[]) {
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('meo_news_updated'));
  } catch (e) {
    console.error('Failed to save news posts', e);
  }
}

export function addNewsPost(post: Omit<NewsPost, 'id' | 'publishedAt'> & { publishedAt?: string }): NewsPost {
  const posts = getNewsPosts();
  const dateStr = post.publishedAt || new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const newPost: NewsPost = {
    ...post,
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    publishedAt: dateStr,
    isPublished: post.isPublished !== undefined ? post.isPublished : true,
    readTimeMinutes: post.readTimeMinutes || 3,
  };

  const updated = [newPost, ...posts];
  saveNewsPosts(updated);

  // Sync to server asynchronously
  fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost),
  }).catch((e) => console.warn('Could not sync news to server:', e));

  return newPost;
}

export function updateNewsPost(id: string, updates: Partial<NewsPost>): NewsPost | null {
  const posts = getNewsPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedPost: NewsPost = {
    ...posts[index],
    ...updates,
  };

  posts[index] = updatedPost;
  saveNewsPosts(posts);

  // Sync to server asynchronously
  fetch(`/api/news/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).catch((e) => console.warn('Could not sync news update to server:', e));

  return updatedPost;
}

export function deleteNewsPost(id: string): boolean {
  const posts = getNewsPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  saveNewsPosts(filtered);

  // Sync to server asynchronously
  fetch(`/api/news/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((e) => console.warn('Could not sync news deletion to server:', e));

  return true;
}

export function resetToDefaultNews() {
  saveNewsPosts(INITIAL_NEWS_POSTS);

  // Sync to server asynchronously
  fetch('/api/news/reset', {
    method: 'POST',
  }).catch((e) => console.warn('Could not sync news reset to server:', e));
}
