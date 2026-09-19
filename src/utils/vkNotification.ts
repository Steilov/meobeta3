import { Booking } from '../types';

export interface VkNotificationResult {
  success: boolean;
  messageId?: number;
  error?: string;
  errorCode?: number;
}

/**
 * Sends a notification about a new booking to the studio's VK community/admin.
 */
export async function sendVkBookingNotification(booking: Booking): Promise<VkNotificationResult> {
  try {
    const res = await fetch('/api/vk-notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ booking }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to notify VK:', err);
    return {
      success: false,
      error: err?.message || 'Сетевая ошибка при отправке в ВК',
    };
  }
}

/**
 * Sends a test ping to VK to verify integration.
 */
export async function sendVkTestPing(): Promise<VkNotificationResult> {
  try {
    const res = await fetch('/api/vk-notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testMessage: true }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to send test ping to VK:', err);
    return {
      success: false,
      error: err?.message || 'Сетевая ошибка при проверке ВК',
    };
  }
}
