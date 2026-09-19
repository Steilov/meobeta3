import { Booking, BlockedSlot, NewsPost, ServiceItem, Review } from '../types';

export interface ServerSyncData {
  version: number;
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  customSlotsMap: Record<string, string[]>;
  news: NewsPost[];
  services: ServiceItem[];
  reviews: Review[];
  customLogo?: string;
}

// Storage keys
export const STORAGE_KEYS = {
  BLOCKED_SLOTS: 'meo_blocked_slots',
  CUSTOM_SLOTS: 'meo_custom_slots',
  NEWS: 'meo_news_posts_v1',
  SERVICES: 'meo_custom_services_v1',
  USER_BOOKINGS: 'tefi_user_bookings',
  ALL_BOOKINGS: 'meo_all_server_bookings',
  CUSTOM_REVIEWS: 'tefi_custom_reviews',
  LOGO: 'meo_custom_logo',
  LAST_SYNC_VERSION: 'meo_sync_version',
};

let currentVersion = 0;
let isSyncing = false;
let eventSource: EventSource | null = null;

/**
 * Dispatches a DOM CustomEvent across the window to notify all listening React hooks and components.
 */
export function emitSyncEvent(eventName: string, detail?: any) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Applies fetched server data to localStorage and informs UI components.
 */
export function applyServerState(data: ServerSyncData) {
  if (!data) return;

  try {
    if (typeof window !== 'undefined') {
      // 1. Blocked Slots
      if (Array.isArray(data.blockedSlots)) {
        localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(data.blockedSlots));
      }

      // 2. Custom Slots Map
      if (data.customSlotsMap && typeof data.customSlotsMap === 'object') {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SLOTS, JSON.stringify(data.customSlotsMap));
      }

      // 3. News Posts
      if (Array.isArray(data.news) && data.news.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(data.news));
      }

      // 4. Services
      if (Array.isArray(data.services) && data.services.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      }

      // 5. All Server Bookings (for Admin and checking slots)
      if (Array.isArray(data.bookings)) {
        localStorage.setItem(STORAGE_KEYS.ALL_BOOKINGS, JSON.stringify(data.bookings));
      }

      // 6. Custom User Reviews
      if (Array.isArray(data.reviews)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_REVIEWS, JSON.stringify(data.reviews));
      }

      // 7. Custom Logo
      if (data.customLogo) {
        localStorage.setItem(STORAGE_KEYS.LOGO, data.customLogo);
      }

      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_VERSION, String(data.version));
    }

    currentVersion = data.version;

    // Notify all UI sections
    emitSyncEvent('meo_schedule_updated');
    emitSyncEvent('meo_news_updated');
    emitSyncEvent('meo_services_updated');
    emitSyncEvent('meo_bookings_updated', data.bookings);
    emitSyncEvent('meo_reviews_updated', data.reviews);
    emitSyncEvent('meo_logo_updated', data.customLogo);
  } catch (err) {
    console.error('Error applying server state:', err);
  }
}

/**
 * Fetches the latest global state from the backend server (/api/sync).
 */
export async function syncFromServer(): Promise<ServerSyncData | null> {
  if (isSyncing) return null;
  isSyncing = true;

  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data: ServerSyncData = await res.json();
    applyServerState(data);
    return data;
  } catch (err) {
    // Graceful offline fallback (local state continues working)
    return null;
  } finally {
    isSyncing = false;
  }
}

/**
 * Initializes real-time Server-Sent Events (SSE) and periodic polling.
 */
export function initRealtimeSync() {
  if (typeof window === 'undefined') return;

  // Immediate initial sync
  syncFromServer();

  // Setup EventSource for push notifications
  setupEventSource();

  // Periodic polling fallback (every 4 seconds) to guarantee real-time updates
  // even if network or proxy drops SSE temporarily
  const pollInterval = setInterval(() => {
    syncFromServer();
  }, 4000);

  // Sync immediately when tab becomes active / gains focus
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      syncFromServer();
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        setupEventSource();
      }
    }
  };

  const handleFocus = () => {
    syncFromServer();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  return () => {
    clearInterval(pollInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

function setupEventSource() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

  try {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.version !== currentVersion) {
          syncFromServer();
        }
      } catch {
        // Heartbeat or malformed payload
      }
    };

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      // Retry in 3 seconds
      setTimeout(setupEventSource, 3000);
    };
  } catch (err) {
    console.warn('Could not initialize SSE, falling back to fast polling', err);
  }
}

// -------------------------------------------------------------------
// API Action Helpers that update both Server and Local Cache
// -------------------------------------------------------------------

/**
 * Creates a new booking on the server and blocks the slot for all clients.
 */
export async function createBookingOnServer(booking: Booking): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Не удалось оформить запись. Попробуйте еще раз.',
      };
    }

    // Refresh immediately
    await syncFromServer();

    return {
      success: true,
      booking: data.booking,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Сетевая ошибка при отправке бронирования',
    };
  }
}

/**
 * Cancels a booking on the server and unblocks the slot for everyone.
 */
export async function cancelBookingOnServer(bookingId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await syncFromServer();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Adds a new review to the server so it appears for all visitors.
 */
export async function createReviewOnServer(review: Review): Promise<boolean> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });

    if (res.ok) {
      await syncFromServer();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
