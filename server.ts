import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { SERVICES_DATA } from './src/data/servicesData';
import { INITIAL_NEWS_POSTS } from './src/data/newsData';
import { Booking, BlockedSlot, NewsPost, ServiceItem, Review } from './src/types';

const app = express();
// Support PORT provided by hosting environments like Render.com, fallback to 3000
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// PERSISTENT SERVER-SIDE DATABASE STORAGE
// -------------------------------------------------------------
interface ServerStore {
  version: number;
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  customSlotsMap: Record<string, string[]>;
  news: NewsPost[];
  services: ServiceItem[];
  reviews: Review[];
  customLogo?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'meo_db.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        version: data.version || 1,
        bookings: Array.isArray(data.bookings) ? data.bookings : [],
        blockedSlots: Array.isArray(data.blockedSlots) ? data.blockedSlots : [],
        customSlotsMap: data.customSlotsMap && typeof data.customSlotsMap === 'object' ? data.customSlotsMap : {},
        news: Array.isArray(data.news) && data.news.length > 0 ? data.news : INITIAL_NEWS_POSTS,
        services: Array.isArray(data.services) && data.services.length > 0 ? data.services : SERVICES_DATA,
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        customLogo: data.customLogo || '',
      };
    }
  } catch (e) {
    console.error('Failed to read database file, initializing with defaults', e);
  }

  const initialStore: ServerStore = {
    version: 1,
    bookings: [],
    blockedSlots: [],
    customSlotsMap: {},
    news: INITIAL_NEWS_POSTS,
    services: SERVICES_DATA,
    reviews: [],
    customLogo: '',
  };

  saveStore(initialStore);
  return initialStore;
}

let store: ServerStore = loadStore();

function saveStore(storeToSave: ServerStore = store) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(storeToSave, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist store to disk', e);
  }
}

// -------------------------------------------------------------
// REAL-TIME SYNCHRONIZATION (Server-Sent Events)
// -------------------------------------------------------------
const sseClients = new Set<express.Response>();

function broadcastChange(type: string, data?: any) {
  store.version = (store.version || 0) + 1;
  saveStore();
  const payload = JSON.stringify({ type, version: store.version, data });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keepalive heartbeat for SSE connections (every 25 seconds)
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000);

// SSE Endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', version: store.version })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Full state synchronization endpoint
app.get('/api/sync', (req, res) => {
  res.json({
    success: true,
    version: store.version,
    bookings: store.bookings,
    blockedSlots: store.blockedSlots,
    customSlotsMap: store.customSlotsMap,
    news: store.news,
    services: store.services,
    reviews: store.reviews,
    customLogo: store.customLogo,
  });
});

// -------------------------------------------------------------
// BOOKINGS & SCHEDULE ENDPOINTS
// -------------------------------------------------------------

// API: Create new booking and automatically block slot across all devices
app.post('/api/bookings', async (req, res) => {
  try {
    const booking: Booking = req.body;
    if (!booking || !booking.date || !booking.timeSlot || !booking.clientName || !booking.clientPhone) {
      return res.status(400).json({ success: false, error: 'Неполные данные для оформления записи' });
    }

    // Atomically check if slot is already occupied/blocked
    const isAlreadyBlocked = store.blockedSlots.some(
      (b) => b.date === booking.date && b.time === booking.timeSlot
    );

    if (isAlreadyBlocked) {
      return res.status(409).json({
        success: false,
        error: `Выбранное время (${booking.timeSlot} на ${booking.date}) уже занято другим клиентом. Пожалуйста, выберите другое свободное время!`,
        conflict: true,
      });
    }

    // Add booking to list
    const newBooking: Booking = {
      ...booking,
      id: booking.id || `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: booking.createdAt || new Date().toISOString(),
      status: 'confirmed',
    };

    store.bookings = [newBooking, ...store.bookings];

    // Atomically block slot
    const newBlockedSlot: BlockedSlot = {
      date: booking.date,
      time: booking.timeSlot,
      reason: 'Онлайн-запись с сайта',
      note: `${booking.clientName.trim()} (${booking.clientPhone.trim()})`,
      blockedAt: new Date().toISOString(),
    };

    store.blockedSlots = [
      ...store.blockedSlots.filter((b) => !(b.date === booking.date && b.time === booking.timeSlot)),
      newBlockedSlot,
    ];

    // Broadcast change immediately to all users!
    broadcastChange('booking_created', { booking: newBooking, blockedSlot: newBlockedSlot });

    // Send VK notification asynchronously
    sendVkInternal(newBooking).catch((err) => {
      console.warn('VK notification notice:', err);
    });

    return res.json({
      success: true,
      booking: newBooking,
      blockedSlots: store.blockedSlots,
    });
  } catch (err: any) {
    console.error('Error in /api/bookings:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// API: Cancel booking (frees up the slot for everyone)
app.delete('/api/bookings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const targetBooking = store.bookings.find((b) => b.id === id);

    if (targetBooking) {
      // Remove or mark cancelled
      store.bookings = store.bookings.filter((b) => b.id !== id);

      // Unblock slot if blocked by online booking
      store.blockedSlots = store.blockedSlots.filter(
        (b) => !(b.date === targetBooking.date && b.time === targetBooking.timeSlot)
      );

      broadcastChange('booking_cancelled', { id, date: targetBooking.date, time: targetBooking.timeSlot });
    }

    return res.json({ success: true, blockedSlots: store.blockedSlots });
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// API: Block schedule slot
app.post('/api/schedule/block', (req, res) => {
  try {
    const { date, time, reason, note } = req.body;
    if (!date || !time) {
      return res.status(400).json({ success: false, error: 'Дата и время обязательны' });
    }

    const filtered = store.blockedSlots.filter((b) => !(b.date === date && b.time === time));
    const newSlot: BlockedSlot = {
      date,
      time,
      reason: reason || 'Запись по телефону',
      note: note || '',
      blockedAt: new Date().toISOString(),
    };

    store.blockedSlots = [...filtered, newSlot];
    broadcastChange('schedule_updated', { blockedSlots: store.blockedSlots });

    return res.json({ success: true, blockedSlots: store.blockedSlots });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// API: Unblock schedule slot
app.post('/api/schedule/unblock', (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ success: false, error: 'Дата и время обязательны' });
    }

    store.blockedSlots = store.blockedSlots.filter((b) => !(b.date === date && b.time === time));
    broadcastChange('schedule_updated', { blockedSlots: store.blockedSlots });

    return res.json({ success: true, blockedSlots: store.blockedSlots });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// API: Add custom time slot for date
app.post('/api/schedule/custom-slot', (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time || !time.includes(':')) {
      return res.status(400).json({ success: false, error: 'Неверные данные слота' });
    }

    const current = store.customSlotsMap[date] || [];
    if (!current.includes(time)) {
      store.customSlotsMap[date] = [...current, time].sort();
      broadcastChange('schedule_updated', { customSlotsMap: store.customSlotsMap });
    }

    return res.json({ success: true, customSlotsMap: store.customSlotsMap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// API: Reset schedule for date
app.post('/api/schedule/reset', (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ success: false, error: 'Дата обязательна' });

    store.blockedSlots = store.blockedSlots.filter((b) => b.date !== date);
    delete store.customSlotsMap[date];
    broadcastChange('schedule_updated');

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// SERVICES ENDPOINTS
// -------------------------------------------------------------
app.post('/api/services', (req, res) => {
  try {
    const service: ServiceItem = req.body;
    if (!service || !service.name) return res.status(400).json({ success: false, error: 'Неполные данные' });

    const newService: ServiceItem = {
      ...service,
      id: service.id || `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    store.services = [newService, ...store.services];
    broadcastChange('services_updated', { services: store.services });
    return res.json({ success: true, service: newService });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.put('/api/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Услуга не найдена' });

    store.services[index] = { ...store.services[index], ...updates };
    broadcastChange('services_updated', { services: store.services });
    return res.json({ success: true, service: store.services[index] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.services = store.services.filter((s) => s.id !== id);
    broadcastChange('services_updated', { services: store.services });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/services/reset', (req, res) => {
  try {
    store.services = SERVICES_DATA;
    broadcastChange('services_updated', { services: store.services });
    return res.json({ success: true, services: store.services });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// -------------------------------------------------------------
// NEWS ENDPOINTS
// -------------------------------------------------------------
app.post('/api/news', (req, res) => {
  try {
    const post: NewsPost = req.body;
    if (!post || !post.title || !post.content) {
      return res.status(400).json({ success: false, error: 'Неполные данные статьи' });
    }

    const newPost: NewsPost = {
      ...post,
      id: post.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      publishedAt: post.publishedAt || new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      isPublished: post.isPublished !== undefined ? post.isPublished : true,
    };

    store.news = [newPost, ...store.news];
    broadcastChange('news_updated', { news: store.news });
    return res.json({ success: true, post: newPost });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.put('/api/news/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const index = store.news.findIndex((p) => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Статья не найдена' });

    store.news[index] = { ...store.news[index], ...updates };
    broadcastChange('news_updated', { news: store.news });
    return res.json({ success: true, post: store.news[index] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/news/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.news = store.news.filter((p) => p.id !== id);
    broadcastChange('news_updated', { news: store.news });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/news/reset', (req, res) => {
  try {
    store.news = INITIAL_NEWS_POSTS;
    broadcastChange('news_updated', { news: store.news });
    return res.json({ success: true, news: store.news });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// -------------------------------------------------------------
// REVIEWS ENDPOINTS
// -------------------------------------------------------------
app.post('/api/reviews', (req, res) => {
  try {
    const review: Review = req.body;
    if (!review || !review.author || !review.text) {
      return res.status(400).json({ success: false, error: 'Неполные данные отзыва' });
    }

    const newReview: Review = {
      ...review,
      id: review.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: review.date || 'Сегодня',
      rating: review.rating || 5,
      source: review.source || 'site',
      verified: true,
      avatarColor: review.avatarColor || 'bg-[#C57280] text-white',
    };

    store.reviews = [newReview, ...store.reviews];
    broadcastChange('reviews_updated', { reviews: store.reviews });
    return res.json({ success: true, review: newReview });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/reviews/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.reviews = store.reviews.filter((r) => r.id !== id);
    broadcastChange('reviews_updated', { reviews: store.reviews });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// -------------------------------------------------------------
// LOGO UPLOAD ENDPOINT
// -------------------------------------------------------------
app.post('/api/upload-logo', async (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || !dataUrl.includes('base64,')) {
      return res.status(400).json({ success: false, error: 'Неверный формат изображения' });
    }

    const base64Data = dataUrl.split('base64,')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const publicDir = path.join(process.cwd(), 'public');
    const distDir = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'ЛОГО.jpg'), buffer);
    fs.writeFileSync(path.join(publicDir, 'logo.jpg'), buffer);
    fs.writeFileSync(path.join(publicDir, 'meo_logo.png'), buffer);
    fs.writeFileSync(path.join(publicDir, 'i (1).webp'), buffer);

    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'ЛОГО.jpg'), buffer);
      fs.writeFileSync(path.join(distDir, 'logo.jpg'), buffer);
      fs.writeFileSync(path.join(distDir, 'meo_logo.png'), buffer);
      fs.writeFileSync(path.join(distDir, 'i (1).webp'), buffer);
    }

    store.customLogo = `/meo_logo.png?v=${Date.now()}`;
    broadcastChange('logo_updated', { customLogo: store.customLogo });

    return res.json({ success: true, message: 'Оригинальный логотип успешно сохранен на сервере!', logoUrl: store.customLogo });
  } catch (err: any) {
    console.error('Error saving logo:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// VK NOTIFICATION DISPATCHER
// -------------------------------------------------------------
const VK_ACCESS_TOKEN =
  process.env.VK_ACCESS_TOKEN ||
  'vk1.a.pONO7Ij6aTPW8PTCiVTXhl8ZL7zWB5nO7tejcmSTZYSanzC-25EKi-BZHUZrLxJT7Rgma4ZI2jw3d3UoUMQaZQh5wGF2nfOX3D5DYl64LqiyiF4-SqBTStHwCG_6IicI2O1HwKr4U1lrcFg6_2o0PxuY-IoDL2eZI-wm8gw-lRh1nPfnscZdJpUg858BV7cGmaq3_HcaBwVUIXKSIXJEIQ';

const VK_TARGET_USER_ID = process.env.VK_TARGET_USER_ID || '510524955';

async function sendVkInternal(booking?: Booking, testMessage?: boolean) {
  let messageText = '';

  if (testMessage) {
    messageText = `🔔 ТЕСТОВОЕ СООБЩЕНИЕ ИЗ СТУДИИ MEO\n\nСвязь сайта с сообществом ВКонтакте успешно настроена!\nУведомления о записях будут приходить сюда в реальном времени.`;
  } else if (booking) {
    const priceText =
      booking.price && booking.price > 0
        ? `${Number(booking.price).toLocaleString('ru-RU')} ₽`
        : 'По согласованию';

    messageText = [
      '🌸 НОВАЯ ЗАПИСЬ С САЙТА MEO!',
      '',
      `💆 Услуга: ${booking.serviceName || 'Не указана'}`,
      `📅 Дата: ${booking.date}`,
      `⏱ Время: ${booking.timeSlot} (~${booking.durationMinutes || 60} мин)`,
      `💰 Стоимость: ${priceText}`,
      '',
      `👤 Клиент: ${booking.clientName}`,
      `📞 Телефон: ${booking.clientPhone}`,
      booking.clientComment ? `💬 Комментарий: «${booking.clientComment}»` : '',
      '',
      `🕒 Создано: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)`
    ]
      .filter(Boolean)
      .join('\n');
  }

  const randomId = Math.floor(Math.random() * 2147483647);
  const params = new URLSearchParams();
  params.append('access_token', VK_ACCESS_TOKEN);
  params.append('user_id', VK_TARGET_USER_ID);
  params.append('random_id', randomId.toString());
  params.append('message', messageText);
  params.append('v', '5.199');

  const vkResponse = await fetch('https://api.vk.com/method/messages.send', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const vkData = (await vkResponse.json()) as { error?: { error_code: number; error_msg: string }; response?: number };
  if (vkData.error) {
    throw new Error(vkData.error.error_msg);
  }
  return vkData.response;
}

app.post('/api/vk-notify', async (req, res) => {
  try {
    const { booking, testMessage } = req.body;
    const response = await sendVkInternal(booking, testMessage);
    return res.json({ success: true, messageId: response });
  } catch (err: any) {
    console.error('VK notify error:', err);
    return res.status(400).json({ success: false, error: err?.message || 'VK API Error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    vkConfigured: Boolean(VK_ACCESS_TOKEN),
    storeVersion: store.version,
    activeBookings: store.bookings.length,
    activeSseClients: sseClients.size,
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();

