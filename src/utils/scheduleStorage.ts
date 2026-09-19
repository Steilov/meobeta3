import { BlockedSlot } from '../types';

// Default 2-hour interval slots for booking (from earliest 08:30 to latest 20:30)
// Official work hours: 10:00 – 22:00
export const DEFAULT_TIME_SLOTS = [
  '08:30',
  '10:30',
  '12:30',
  '14:30',
  '16:30',
  '18:30',
  '20:30',
];

const BLOCKED_SLOTS_KEY = 'meo_blocked_slots';
const CUSTOM_SLOTS_KEY = 'meo_custom_slots';

// Structure in localStorage: BlockedSlot[]
export function getBlockedSlots(): BlockedSlot[] {
  try {
    const raw = localStorage.getItem(BLOCKED_SLOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load blocked slots', e);
    return [];
  }
}

export function saveBlockedSlots(slots: BlockedSlot[]) {
  try {
    localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(slots));
    window.dispatchEvent(new CustomEvent('meo_schedule_updated'));
  } catch (e) {
    console.error('Failed to save blocked slots', e);
  }
}

// Custom added slots per date: { [dateIso: string]: string[] }
export function getCustomSlotsMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(CUSTOM_SLOTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom slots', e);
    return {};
  }
}

export function saveCustomSlotsMap(map: Record<string, string[]>) {
  try {
    localStorage.setItem(CUSTOM_SLOTS_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('meo_schedule_updated'));
  } catch (e) {
    console.error('Failed to save custom slots', e);
  }
}

export function getAllSlotsForDate(dateIso: string): string[] {
  const customMap = getCustomSlotsMap();
  const added = customMap[dateIso] || [];
  const combined = Array.from(new Set([...DEFAULT_TIME_SLOTS, ...added]));
  // Sort times chronologically
  return combined.sort((a, b) => a.localeCompare(b));
}

export function isSlotBlocked(dateIso: string, time: string): BlockedSlot | undefined {
  const blocked = getBlockedSlots();
  return blocked.find((b) => b.date === dateIso && b.time === time);
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether a given slot time on dateIso has already passed relative to the current time.
 * If date is in the past: true.
 * If date is in the future: false.
 * If date is today: checks whether the slot time is before (or within a buffer of) now.
 *
 * bufferMinutes: optional buffer before slot start (e.g. 0 or 15 mins). By default 0 mins.
 */
export function isTimePassedForDate(dateIso: string, time: string, bufferMinutes = 0): boolean {
  if (!dateIso || !time) return false;

  const todayIso = getTodayIso();

  // If the date is earlier than today (e.g. yesterday)
  if (dateIso < todayIso) {
    return true;
  }

  // If the date is in the future
  if (dateIso > todayIso) {
    return false;
  }

  // If date is today, compare hours and minutes
  const now = new Date();
  const [slotHStr, slotMStr] = time.split(':');
  const slotH = parseInt(slotHStr, 10);
  const slotM = parseInt(slotMStr, 10);
  if (isNaN(slotH) || isNaN(slotM)) return false;

  const slotTotalMinutes = slotH * 60 + slotM;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + bufferMinutes;

  return slotTotalMinutes <= currentTotalMinutes;
}

export function isSlotAvailable(dateIso: string, time: string): boolean {
  // If slot is blocked manually by phone or already booked
  if (isSlotBlocked(dateIso, time)) {
    return false;
  }
  // If slot time has already passed today
  if (isTimePassedForDate(dateIso, time)) {
    return false;
  }
  return true;
}

export function blockSlot(dateIso: string, time: string, reason: string = 'Запись по телефону', note: string = '') {
  const current = getBlockedSlots();
  const filtered = current.filter((b) => !(b.date === dateIso && b.time === time));
  const updated: BlockedSlot[] = [
    ...filtered,
    {
      date: dateIso,
      time,
      reason,
      note,
      blockedAt: new Date().toISOString(),
    },
  ];
  saveBlockedSlots(updated);

  // Sync to server asynchronously
  fetch('/api/schedule/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: dateIso, time, reason, note }),
  }).catch((e) => console.warn('Could not sync block to server:', e));
}

export function unblockSlot(dateIso: string, time: string) {
  const current = getBlockedSlots();
  const updated = current.filter((b) => !(b.date === dateIso && b.time === time));
  saveBlockedSlots(updated);

  // Sync to server asynchronously
  fetch('/api/schedule/unblock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: dateIso, time }),
  }).catch((e) => console.warn('Could not sync unblock to server:', e));
}

export function addCustomTimeSlot(dateIso: string, time: string) {
  if (!time || !time.includes(':')) return;
  const map = getCustomSlotsMap();
  const current = map[dateIso] || [];
  if (!current.includes(time)) {
    map[dateIso] = [...current, time];
    saveCustomSlotsMap(map);

    // Sync to server asynchronously
    fetch('/api/schedule/custom-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateIso, time }),
    }).catch((e) => console.warn('Could not sync custom slot to server:', e));
  }
}

export function resetScheduleForDate(dateIso: string) {
  const blocked = getBlockedSlots().filter((b) => b.date !== dateIso);
  saveBlockedSlots(blocked);
  const map = getCustomSlotsMap();
  delete map[dateIso];
  saveCustomSlotsMap(map);

  // Sync to server asynchronously
  fetch('/api/schedule/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: dateIso }),
  }).catch((e) => console.warn('Could not sync reset to server:', e));
}

