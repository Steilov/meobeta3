import { ServiceItem } from '../types';
import { SERVICES_DATA } from '../data/servicesData';

const SERVICES_STORAGE_KEY = 'meo_custom_services_v1';

export function getStoredServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(SERVICES_DATA));
      return SERVICES_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SERVICES_DATA;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load services from localStorage', e);
    return SERVICES_DATA;
  }
}

export function saveStoredServices(services: ServiceItem[]) {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent('meo_services_updated'));
  } catch (e) {
    console.error('Failed to save services to localStorage', e);
  }
}

export function addService(data: Omit<ServiceItem, 'id'> & { id?: string }): ServiceItem {
  const current = getStoredServices();
  const newService: ServiceItem = {
    ...data,
    id: data.id || `meo-srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const updated = [newService, ...current];
  saveStoredServices(updated);

  // Sync to server asynchronously
  fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newService),
  }).catch((e) => console.warn('Could not sync service to server:', e));

  return newService;
}

export function updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
  const current = getStoredServices();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedService: ServiceItem = {
    ...current[index],
    ...updates,
  };

  current[index] = updatedService;
  saveStoredServices(current);

  // Sync to server asynchronously
  fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).catch((e) => console.warn('Could not sync service update to server:', e));

  return updatedService;
}

export function deleteService(id: string): boolean {
  const current = getStoredServices();
  const filtered = current.filter((s) => s.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredServices(filtered);

  // Sync to server asynchronously
  fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((e) => console.warn('Could not sync service deletion to server:', e));

  return true;
}

export function resetServicesToDefault(): ServiceItem[] {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(SERVICES_DATA));
    window.dispatchEvent(new CustomEvent('meo_services_updated'));

    // Sync to server asynchronously
    fetch('/api/services/reset', {
      method: 'POST',
    }).catch((e) => console.warn('Could not sync services reset to server:', e));
  } catch (e) {
    console.error('Failed to reset services', e);
  }
  return SERVICES_DATA;
}
