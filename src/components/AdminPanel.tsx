import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  X,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Check,
  PhoneCall,
  Lock,
  Unlock,
  BookOpen,
  FileText,
  Sparkles,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  User,
  CheckCircle2,
  Tag,
  Send,
  MessageCircle,
  ExternalLink,
  Upload,
  Link,
  Search,
  Star,
  Layers,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ORIGINAL_MEO_LOGO_URL } from './MeoLogo';
import { ServiceItem, ServiceCategory, NewsPost, NewsCategory, BlockedSlot, Booking } from '../types';
import { compressImageFile } from '../utils/imageUpload';
import {
  getAllSlotsForDate,
  getBlockedSlots,
  blockSlot,
  unblockSlot,
  addCustomTimeSlot,
  resetScheduleForDate,
  isTimePassedForDate
} from '../utils/scheduleStorage';
import {
  getNewsPosts,
  addNewsPost,
  updateNewsPost,
  deleteNewsPost,
  resetToDefaultNews
} from '../utils/newsStorage';
import {
  getStoredServices,
  addService,
  updateService,
  deleteService,
  resetServicesToDefault
} from '../utils/servicesStorage';
import { cancelBookingOnServer } from '../utils/syncManager';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
}

const PHOTO_PRESETS = [
  {
    name: 'Инъекции & Ботокс',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Косметология лица',
    url: 'https://images.unsplash.com/photo-1512290900672-1f02e1b10168?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Массаж & Тело',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Интерьер студии',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Консультация врача',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, bookings }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'schedule' | 'services' | 'news' | 'bookings' | 'logo'>('schedule');

  // Logo Management State
  const [customLogoPreview, setCustomLogoPreview] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('meo_custom_logo') || ORIGINAL_MEO_LOGO_URL;
    }
    return ORIGINAL_MEO_LOGO_URL;
  });
  const [logoSuccessMsg, setLogoSuccessMsg] = useState<string>('');

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        localStorage.setItem('meo_custom_logo', dataUrl);
        setCustomLogoPreview(dataUrl);
        window.dispatchEvent(new Event('meo_logo_updated'));

        try {
          await fetch('/api/upload-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl, filename: file.name }),
          });
        } catch (err) {
          console.error('Server save error:', err);
        }

        setLogoSuccessMsg('Оригинальный логотип успешно загружен и применен ко всем элементам сайта!');
        setTimeout(() => setLogoSuccessMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    localStorage.removeItem('meo_custom_logo');
    setCustomLogoPreview(ORIGINAL_MEO_LOGO_URL);
    window.dispatchEvent(new Event('meo_logo_updated'));
    setLogoSuccessMsg('Логотип сброшен к оригинальному файлу MEO');
    setTimeout(() => setLogoSuccessMsg(''), 4000);
  };

  // Services Management State
  const [servicesList, setServicesList] = useState<ServiceItem[]>(getStoredServices);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<ServiceCategory | 'all'>('all');

  // Service Modal Form States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [formSrvName, setFormSrvName] = useState('');
  const [formSrvCategory, setFormSrvCategory] = useState<ServiceCategory>('face');
  const [formSrvDescription, setFormSrvDescription] = useState('');
  const [formSrvDuration, setFormSrvDuration] = useState<number>(60);
  const [formSrvPriceType, setFormSrvPriceType] = useState<'fixed' | 'consultation'>('fixed');
  const [formSrvPriceFrom, setFormSrvPriceFrom] = useState<number>(2500);
  const [formSrvPriceTo, setFormSrvPriceTo] = useState<string>('');
  const [formSrvPriceLabel, setFormSrvPriceLabel] = useState('По согласованию');
  const [formSrvPriceNote, setFormSrvPriceNote] = useState('');
  const [formSrvTag, setFormSrvTag] = useState('');
  const [formSrvPopular, setFormSrvPopular] = useState(false);
  const [formSrvIsInjectable, setFormSrvIsInjectable] = useState(false);
  const [formSrvImage, setFormSrvImage] = useState(PHOTO_PRESETS[1].url);
  const [formSrvImageMode, setFormSrvImageMode] = useState<'upload' | 'url' | 'presets'>('presets');
  const [isCompressingSrvImage, setIsCompressingSrvImage] = useState(false);
  const [formSrvSteps, setFormSrvSteps] = useState('');
  const [formSrvVkUrl, setFormSrvVkUrl] = useState('');

  // Schedule states
  const [availableDates, setAvailableDates] = useState<{ iso: string; label: string; full: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [scheduleVersion, setScheduleVersion] = useState(0);

  // New slot modal / inputs
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [slotToBlock, setSlotToBlock] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('Запись по телефону');
  const [blockNote, setBlockNote] = useState('');
  const [newCustomTime, setNewCustomTime] = useState('');

  // News states
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);

  // News Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NewsCategory>('advice');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formImageMode, setFormImageMode] = useState<'upload' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [formAuthorName, setFormAuthorName] = useState('Валерия');
  const [formAuthorRole, setFormAuthorRole] = useState('Врач-косметолог MEO');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  // Success toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate 14 days for schedule
  useEffect(() => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      const dayName = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : daysOfWeek[d.getDay()];
      const label = `${dayName}, ${d.getDate()} ${months[d.getMonth()]}`;
      const full = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      dates.push({ iso, label, full });
    }
    setAvailableDates(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].iso);
    }
  }, []);

  // Load schedule, news & services and keep passed slots synced
  useEffect(() => {
    setBlockedSlots(getBlockedSlots());
    setNewsPosts(getNewsPosts());
    setServicesList(getStoredServices());

    const handleScheduleUpdate = () => {
      setBlockedSlots(getBlockedSlots());
      setScheduleVersion((v) => v + 1);
    };

    const handleNewsUpdate = () => {
      setNewsPosts(getNewsPosts());
    };

    const handleServicesUpdate = () => {
      setServicesList(getStoredServices());
    };

    window.addEventListener('meo_schedule_updated', handleScheduleUpdate);
    window.addEventListener('meo_news_updated', handleNewsUpdate);
    window.addEventListener('meo_services_updated', handleServicesUpdate);

    // Refresh every 30 seconds to update passed time slot statuses
    const interval = setInterval(() => {
      setScheduleVersion((v) => v + 1);
    }, 30000);

    return () => {
      window.removeEventListener('meo_schedule_updated', handleScheduleUpdate);
      window.removeEventListener('meo_news_updated', handleNewsUpdate);
      window.removeEventListener('meo_services_updated', handleServicesUpdate);
      clearInterval(interval);
    };
  }, []);

  // Services Management Handlers
  const handleOpenCreateService = () => {
    setEditingService(null);
    setFormSrvName('');
    setFormSrvCategory('face');
    setFormSrvDescription('');
    setFormSrvDuration(60);
    setFormSrvPriceType('fixed');
    setFormSrvPriceFrom(2500);
    setFormSrvPriceTo('');
    setFormSrvPriceLabel('По согласованию');
    setFormSrvPriceNote('');
    setFormSrvTag('');
    setFormSrvPopular(false);
    setFormSrvIsInjectable(false);
    setFormSrvImage(PHOTO_PRESETS[1].url);
    setFormSrvImageMode('presets');
    setFormSrvSteps('');
    setFormSrvVkUrl('');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setFormSrvName(service.name);
    setFormSrvCategory(service.category);
    setFormSrvDescription(service.description);
    setFormSrvDuration(service.durationMinutes || 60);
    setFormSrvPriceType(service.priceOnConsultation ? 'consultation' : 'fixed');
    setFormSrvPriceFrom(service.priceFrom || 0);
    setFormSrvPriceTo(service.priceTo ? String(service.priceTo) : '');
    setFormSrvPriceLabel(service.priceLabel || 'По согласованию');
    setFormSrvPriceNote(service.priceNote || '');
    setFormSrvTag(service.tag || '');
    setFormSrvPopular(Boolean(service.popular));
    setFormSrvIsInjectable(Boolean(service.isInjectable));
    setFormSrvImage(service.image || PHOTO_PRESETS[1].url);
    setFormSrvImageMode('url');
    setFormSrvSteps(service.includedSteps ? service.includedSteps.join('\n') : '');
    setFormSrvVkUrl(service.vkUrl || '');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSrvName.trim()) {
      showToast('Пожалуйста, укажите название услуги');
      return;
    }

    const steps = formSrvSteps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<ServiceItem, 'id'> = {
      name: formSrvName.trim(),
      category: formSrvCategory,
      description: formSrvDescription.trim(),
      durationMinutes: Number(formSrvDuration) || 60,
      priceFrom: formSrvPriceType === 'consultation' ? 0 : Number(formSrvPriceFrom) || 0,
      priceTo: formSrvPriceTo ? Number(formSrvPriceTo) : undefined,
      priceOnConsultation: formSrvPriceType === 'consultation',
      priceLabel: formSrvPriceType === 'consultation' ? formSrvPriceLabel : undefined,
      priceNote: formSrvPriceNote.trim() || undefined,
      popular: formSrvPopular,
      tag: formSrvTag.trim() || undefined,
      image: formSrvImage.trim() || undefined,
      includedSteps: steps.length > 0 ? steps : undefined,
      vkUrl: formSrvVkUrl.trim() || undefined,
      isInjectable: formSrvIsInjectable,
    };

    if (editingService) {
      const updated = updateService(editingService.id, payload);
      if (updated) {
        setServicesList(getStoredServices());
        showToast(`Услуга «${updated.name}» успешно обновлена`);
        setIsServiceModalOpen(false);
      }
    } else {
      const created = addService(payload);
      setServicesList(getStoredServices());
      showToast(`Услуга «${created.name}» добавлена в каталог`);
      setIsServiceModalOpen(false);
    }
  };

  const handleDeleteService = (id: string, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить услугу «${name}» из каталога?`)) {
      deleteService(id);
      setServicesList(getStoredServices());
      showToast('Услуга удалена');
    }
  };

  const handleTogglePopular = (service: ServiceItem) => {
    const updated = updateService(service.id, { popular: !service.popular });
    if (updated) {
      setServicesList(getStoredServices());
      showToast(updated.popular ? 'Добавлено в Популярные' : 'Удалено из Популярных');
    }
  };

  const handleResetServices = () => {
    if (window.confirm('Сбросить все услуги к исходному списку по умолчанию? Ваши изменения будут заменены базовым каталогом.')) {
      const reset = resetServicesToDefault();
      setServicesList(reset);
      showToast('Каталог услуг сброшен к исходным');
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingSrvImage(true);
    try {
      const base64 = await compressImageFile(file, 1000, 1000, 0.85);
      setFormSrvImage(base64);
      showToast('Фото услуги успешно загружено!');
    } catch (err: any) {
      showToast(`Ошибка загрузки: ${err?.message || 'Попробуйте другое фото'}`);
    } finally {
      setIsCompressingSrvImage(false);
    }
  };

  const filteredServicesList = useMemo(() => {
    return servicesList.filter((s) => {
      const matchesCat = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
      const q = serviceSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.tag && s.tag.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [servicesList, serviceCategoryFilter, serviceSearch]);

  // Current slots for selected date
  const currentDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    return getAllSlotsForDate(selectedDate);
  }, [selectedDate, scheduleVersion]);

  // Schedule slot actions
  const handleOpenBlockModal = (time: string) => {
    setSlotToBlock(time);
    setBlockReason('Запись по телефону');
    setBlockNote('');
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = () => {
    if (!selectedDate || !slotToBlock) return;
    blockSlot(selectedDate, slotToBlock, blockReason, blockNote);
    setIsBlockModalOpen(false);
    setSlotToBlock(null);
    showToast(`Время ${slotToBlock} успешно заблокировано (${blockReason})`);
  };

  const handleUnblock = (time: string) => {
    if (!selectedDate) return;
    unblockSlot(selectedDate, time);
    showToast(`Время ${time} освобождено и доступно для онлайн-записи`);
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newCustomTime.trim()) return;
    addCustomTimeSlot(selectedDate, newCustomTime.trim());
    setNewCustomTime('');
    showToast(`Добавлено новое окно ${newCustomTime} на ${selectedDate}`);
  };

  const handleResetDay = () => {
    if (!selectedDate) return;
    if (confirm(`Сбросить все блокировки времени на ${selectedDate} к стандартным?`)) {
      resetScheduleForDate(selectedDate);
      showToast(`Расписание на ${selectedDate} сброшено`);
    }
  };

  // News actions
  const handleOpenCreateNews = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormCategory('advice');
    setFormExcerpt('');
    setFormContent('');
    setFormCoverImage(PHOTO_PRESETS[0].url);
    setFormImageMode('upload');
    setImageUploadError(null);
    setFormAuthorName('Валерия');
    setFormAuthorRole('Врач-косметолог MEO');
    setFormIsPublished(true);
    setFormFeatured(false);
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (post: NewsPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormCoverImage(post.coverImage);
    setFormImageMode(post.coverImage.startsWith('data:') ? 'upload' : 'url');
    setImageUploadError(null);
    setFormAuthorName(post.authorName || 'Валерия');
    setFormAuthorRole(post.authorRole || 'Врач-косметолог MEO');
    setFormIsPublished(post.isPublished !== false);
    setFormFeatured(!!post.featured);
    setIsNewsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setImageUploadError(null);

    try {
      const dataUrl = await compressImageFile(file, 1200, 1200, 0.82);
      setFormCoverImage(dataUrl);
      showToast('Фотография успешно загружена!');
    } catch (err: any) {
      console.error('Upload error:', err);
      setImageUploadError(err?.message || 'Не удалось обработать изображение');
    } finally {
      setIsProcessingImage(false);
      // Reset input value so same file can be chosen again
      e.target.value = '';
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Пожалуйста, заполните заголовок и текст статьи.');
      return;
    }

    const finalCoverImage = formCoverImage.trim() || PHOTO_PRESETS[0].url;

    const categoryLabels: Record<NewsCategory, string> = {
      injections: 'Инъекционная косметология',
      advice: 'Советы косметолога',
      care: 'Коррекция фигуры',
      news: 'Новости студии',
      promo: 'Акции & Бонусы',
    };

    if (editingPost) {
      updateNewsPost(editingPost.id, {
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: categoryLabels[formCategory],
        excerpt: formExcerpt.trim() || formContent.slice(0, 140) + '...',
        content: formContent.trim(),
        coverImage: finalCoverImage,
        authorName: formAuthorName.trim(),
        authorRole: formAuthorRole.trim(),
        isPublished: formIsPublished,
        featured: formFeatured,
      });
      showToast('Статья успешно обновлена!');
    } else {
      addNewsPost({
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: categoryLabels[formCategory],
        excerpt: formExcerpt.trim() || formContent.slice(0, 140) + '...',
        content: formContent.trim(),
        coverImage: finalCoverImage,
        authorName: formAuthorName.trim(),
        authorRole: formAuthorRole.trim(),
        isPublished: formIsPublished,
        featured: formFeatured,
      });
      showToast('Новая статья опубликована на сайте!');
    }

    setIsNewsModalOpen(false);
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту публикацию?')) {
      deleteNewsPost(id);
      showToast('Публикация удалена.');
    }
  };

  const handleTogglePublish = (post: NewsPost) => {
    const updated = updateNewsPost(post.id, { isPublished: !post.isPublished });
    if (updated) {
      showToast(updated.isPublished ? 'Статья опубликована на сайте' : 'Статья скрыта (в черновиках)');
    }
  };

  const handleCancelAdminBooking = async (booking: Booking) => {
    if (window.confirm(`Отменить запись клиента «${booking.clientName}» на ${booking.date} в ${booking.timeSlot}? Время станет доступно для других посетителей сайта.`)) {
      await cancelBookingOnServer(booking.id);
      unblockSlot(booking.date, booking.timeSlot);
      showToast('Запись отменена, слот времени разблокирован для других клиентов');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isDark ? 'bg-[#150F11] border-[#382329] text-[#F7F1F2]' : 'bg-white border-[#E8CCD5] text-[#1A1014]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Panel Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'bg-[#1C1316] border-[#331F25]' : 'bg-[#FAF2F4] border-[#E8CCD5]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A2434] to-[#C57280] text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-xl font-bold tracking-tight">Панель управления MEO</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Онлайн
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                Управление свободными окнами записи и публикация новостей
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'border-[#382329] text-neutral-300 hover:bg-[#25171B]'
                  : 'border-[#DEC8CF] text-[#423136] hover:bg-neutral-100'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Закрыть</span>
            </button>
          </div>
        </div>

        {/* Panel Navigation Tabs */}
        <div className={`flex border-b px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto ${isDark ? 'border-[#2F1B21] bg-[#170E10]' : 'border-[#E8CCD5] bg-[#FCF8F9]'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-[#C57280] text-[#C57280]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Расписание & Слоты</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'border-[#C57280] text-[#C57280]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Услуги студии ({servicesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'news'
                ? 'border-[#C57280] text-[#C57280]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Новости & Блог ({newsPosts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#C57280] text-[#C57280]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Записи с сайта ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'logo'
                ? 'border-[#C57280] text-[#C57280]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Логотип студии</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: SCHEDULE MANAGEMENT */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Instructions banner */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                  isDark ? 'bg-[#22161A] border-[#C57280]/30 text-neutral-200' : 'bg-[#FAF0F3] border-[#E8CCD5] text-[#4F3C42]'
                }`}
              >
                <PhoneCall className="w-5 h-5 text-[#C57280] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-sm mb-0.5">Управление расписанием и слотами:</strong>
                  <span>
                    Слоты для онлайн-записи настроены с шагом в <strong>2 часа</strong> (с <strong>08:30</strong> до <strong>20:30</strong> при официальном графике 10:00 — 22:00).
                    Если клиент записался по звонку, нажмите <strong>«Занять (запись по тел.)»</strong>. Чтобы вернуть время, нажмите <strong>«Освободить слот»</strong>.
                  </span>
                </div>
              </div>

              {/* Date Selector Pills */}
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between ${isDark ? 'text-neutral-400' : 'text-[#5E484F]'}`}>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C57280]" /> Выберите дату:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDay}
                    className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Сбросить блокировки на эту дату
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {availableDates.map((d) => {
                    const isSelected = selectedDate === d.iso;
                    const blockedCount = blockedSlots.filter((b) => b.date === d.iso).length;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setSelectedDate(d.iso)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#C57280] text-white border-[#C57280] shadow-md'
                            : isDark
                            ? 'bg-[#1C1316] border-[#382329] text-neutral-300 hover:border-neutral-500'
                            : 'bg-white border-[#DEC8CF] text-[#2E1D22] hover:border-[#B6465B]'
                        }`}
                      >
                        <div>{d.label}</div>
                        {blockedCount > 0 && (
                          <div className={`text-[10px] font-normal ${isSelected ? 'text-white/80' : 'text-rose-400'}`}>
                            Занято окон: {blockedCount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Grid for Selected Date */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm sm:text-base font-bold">
                    Окна записи на {availableDates.find((d) => d.iso === selectedDate)?.full || selectedDate}:
                  </h3>
                  <span className="text-xs text-[#C57280] font-bold">
                    Всего слотов: {currentDaySlots.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentDaySlots.map((time) => {
                    const isPassed = isTimePassedForDate(selectedDate, time);
                    const blocked = blockedSlots.find((b) => b.date === selectedDate && b.time === time);
                    const isBookedViaSite = bookings.some((b) => b.date === selectedDate && b.timeSlot === time && b.status !== 'cancelled');

                    return (
                      <div
                        key={time}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          isPassed
                            ? isDark
                              ? 'bg-[#150F11] border-[#2A181C] text-neutral-400 opacity-60'
                              : 'bg-neutral-100 border-neutral-200 text-neutral-500 opacity-70'
                            : blocked || isBookedViaSite
                            ? isDark
                              ? 'bg-[#221317] border-rose-900/50 text-neutral-300'
                              : 'bg-rose-50 border-rose-200 text-[#42222A]'
                            : isDark
                            ? 'bg-[#1C1316] border-[#382329] text-white'
                            : 'bg-white border-[#DEC8CF] text-[#190F13]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-serif text-lg font-bold ${isPassed ? 'line-through text-neutral-400' : ''}`}>{time}</span>
                            {isPassed ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-500/20 text-neutral-400 border border-neutral-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Время прошло
                              </span>
                            ) : blocked ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Занято
                              </span>
                            ) : isBookedViaSite ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Запись с сайта
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Unlock className="w-3 h-3" /> Свободно
                              </span>
                            )}
                          </div>
                        </div>

                        {blocked && (
                          <div className="text-xs space-y-0.5 pt-1 border-t border-rose-500/20">
                            <div className="font-semibold text-rose-400">{blocked.reason}</div>
                            {blocked.note && <div className="text-[11px] opacity-80">{blocked.note}</div>}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-neutral-500/15 flex items-center gap-2 mt-auto">
                          {blocked ? (
                            <button
                              type="button"
                              onClick={() => handleUnblock(time)}
                              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Освободить слот</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenBlockModal(time)}
                              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-[#7A2434] hover:bg-[#B6465B] text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Занять (запись по тел.)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Slot Input */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isDark ? 'bg-[#1C1316] border-[#382329]' : 'bg-[#FAF4F6] border-[#E8CCD5]'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Добавить внеплановое окно на этот день:</h4>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                    Например, раннее утро (08:30) или поздний вечер (20:00)
                  </p>
                </div>

                <form onSubmit={handleAddCustomSlot} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="time"
                    value={newCustomTime}
                    onChange={(e) => setNewCustomTime(e.target.value)}
                    required
                    className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C57280] hover:bg-[#B6465B] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Добавить
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: NEWS & ARTICLES MANAGEMENT */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold">Публикации и статьи бьюти-блога</h3>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                    Добавляйте полезные статьи, советы косметолога, акции и новости студии
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenCreateNews}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7A2434] to-[#C57280] hover:brightness-110 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Опубликовать новую статью</span>
                  </button>
                </div>
              </div>

              {/* News List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                      isDark ? 'bg-[#1C1316] border-[#352127]' : 'bg-white border-[#E8CCD5]'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-20 h-20 rounded-lg object-cover shrink-0 bg-neutral-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C57280]/20 text-[#E8A5B2] border border-[#C57280]/30">
                            {post.categoryLabel || post.category}
                          </span>
                          {post.isPublished === false && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-500/20 text-neutral-400 border border-neutral-500/30">
                              Черновик
                            </span>
                          )}
                          {post.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                              Топ
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-sm font-bold line-clamp-1">{post.title}</h4>
                        <p className={`text-xs line-clamp-2 mt-1 ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                          {post.excerpt}
                        </p>
                        <div className={`text-[10px] mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {post.publishedAt} • {post.authorName}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2.5 border-t border-neutral-500/15 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(post)}
                        className={`text-xs font-medium cursor-pointer flex items-center gap-1 ${
                          post.isPublished === false ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {post.isPublished === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{post.isPublished === false ? 'Опубликовать' : 'В черновик'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNews(post)}
                          className="p-1.5 rounded-lg border border-[#C57280]/40 text-[#C57280] hover:bg-[#C57280]/15 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Редактировать</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNews(post.id)}
                          className="p-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS FROM CLIENTS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold">Онлайн-записи с сайта</h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                  Заявки, оформленные клиентами через интерактивную форму на сайте
                </p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-[#755E65]'}`}>
                    Новых записей с сайта пока нет. Оформите тестовую бронь в окне онлайн-записи.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isDark ? 'bg-[#1C1316] border-[#382329]' : 'bg-white border-[#DEC8CF]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-serif font-bold text-base">{b.serviceName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            {b.status === 'confirmed' ? 'Подтверждено' : 'Отменено'}
                          </span>
                        </div>

                        <div className="text-xs space-y-0.5">
                          <div>
                            <strong>Дата и время:</strong> {b.date} в <strong>{b.timeSlot}</strong> (~{b.durationMinutes} мин)
                          </div>
                          <div>
                            <strong>Клиент:</strong> {b.clientName} •{' '}
                            <a href={`tel:${b.clientPhone}`} className="text-[#C57280] font-bold hover:underline">
                              {b.clientPhone}
                            </a>
                          </div>
                          {b.clientComment && (
                            <div className="italic opacity-80">«{b.clientComment}»</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="font-bold text-sm text-[#C57280]">
                            {b.price === 0 ? 'По согласованию' : `${b.price.toLocaleString('ru-RU')} ₽`}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Оформлено: {new Date(b.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelAdminBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Отменить бронь и открыть это время для других клиентов"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Отменить & открыть слот</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Header Toolbar */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#181114] border-[#2E181D]' : 'bg-[#FAF2F4] border-[#E8CCD5]'
                }`}
              >
                <div>
                  <h3 className="font-serif text-lg font-bold">Каталог услуг и процедур</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                    Редактируйте описания, меняйте цены, добавляйте новые процедуры и управляйте разделом «Хиты»
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetServices}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isDark
                        ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800'
                        : 'border-[#DEC8CF] text-neutral-600 hover:text-black hover:bg-white'
                    }`}
                    title="Сбросить все услуги к начальным настройкам"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Сбросить к исходным</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCreateService}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#7A2434] to-[#C57280] hover:brightness-110 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить новую услугу</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Categories Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      serviceCategoryFilter === 'all'
                        ? 'bg-[#C57280] text-white shadow-xs'
                        : isDark
                        ? 'bg-[#1C1417] text-neutral-300 hover:bg-[#2A1D22]'
                        : 'bg-white text-[#4A3B40] border border-[#E8CCD5] hover:bg-pink-50/50'
                    }`}
                  >
                    Все ({servicesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('face')}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      serviceCategoryFilter === 'face'
                        ? 'bg-[#C57280] text-white shadow-xs'
                        : isDark
                        ? 'bg-[#1C1417] text-neutral-300 hover:bg-[#2A1D22]'
                        : 'bg-white text-[#4A3B40] border border-[#E8CCD5] hover:bg-pink-50/50'
                    }`}
                  >
                    Лицо ({servicesList.filter((s) => s.category === 'face').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('body')}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      serviceCategoryFilter === 'body'
                        ? 'bg-[#C57280] text-white shadow-xs'
                        : isDark
                        ? 'bg-[#1C1417] text-neutral-300 hover:bg-[#2A1D22]'
                        : 'bg-white text-[#4A3B40] border border-[#E8CCD5] hover:bg-pink-50/50'
                    }`}
                  >
                    Тело ({servicesList.filter((s) => s.category === 'body').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('injections')}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      serviceCategoryFilter === 'injections'
                        ? 'bg-[#C57280] text-white shadow-xs'
                        : isDark
                        ? 'bg-[#1C1417] text-neutral-300 hover:bg-[#2A1D22]'
                        : 'bg-white text-[#4A3B40] border border-[#E8CCD5] hover:bg-pink-50/50'
                    }`}
                  >
                    Инъекции ({servicesList.filter((s) => s.category === 'injections').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('posture')}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      serviceCategoryFilter === 'posture'
                        ? 'bg-[#C57280] text-white shadow-xs'
                        : isDark
                        ? 'bg-[#1C1417] text-neutral-300 hover:bg-[#2A1D22]'
                        : 'bg-white text-[#4A3B40] border border-[#E8CCD5] hover:bg-pink-50/50'
                    }`}
                  >
                    Осанка ({servicesList.filter((s) => s.category === 'posture').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('packages')}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      serviceCategoryFilter === 'packages'
                        ? 'bg-[#C57280] text-white shadow-xs'
                        : isDark
                        ? 'bg-[#1C1417] text-neutral-300 hover:bg-[#2A1D22]'
                        : 'bg-white text-[#4A3B40] border border-[#E8CCD5] hover:bg-pink-50/50'
                    }`}
                  >
                    Комплексы ({servicesList.filter((s) => s.category === 'packages').length})
                  </button>
                </div>

                {/* Search */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Поиск по названию или тегу..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border outline-none ${
                      isDark
                        ? 'bg-[#160E11] border-[#382329] text-white focus:border-[#C57280]'
                        : 'bg-white border-[#DEC8CF] text-black focus:border-[#C57280]'
                    }`}
                  />
                  {serviceSearch && (
                    <button
                      type="button"
                      onClick={() => setServiceSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Service Cards Grid */}
              {filteredServicesList.length === 0 ? (
                <div
                  className={`p-10 rounded-2xl border text-center space-y-3 ${
                    isDark ? 'bg-[#181114] border-[#2E181D]' : 'bg-white border-[#E8CCD5]'
                  }`}
                >
                  <Sparkles className="w-8 h-8 mx-auto text-neutral-400" />
                  <div className="font-serif text-base font-bold">Ничего не найдено</div>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    По вашему запросу не найдено ни одной услуги. Попробуйте изменить параметры поиска или добавьте новую процедуру.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateService}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7A2434] hover:bg-[#B6465B] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить процедуру</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredServicesList.map((service) => {
                    const categoryBadgeMap: Record<ServiceCategory, { label: string; cls: string }> = {
                      body: { label: 'Тело', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                      face: { label: 'Лицо', cls: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
                      injections: { label: 'Инъекции', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                      posture: { label: 'Осанка', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
                      packages: { label: 'Комплекс', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                    };
                    const catInfo = categoryBadgeMap[service.category] || { label: service.category, cls: 'bg-neutral-500/20 text-neutral-400' };

                    return (
                      <div
                        key={service.id}
                        className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                          isDark ? 'bg-[#181114] border-[#2E181D]' : 'bg-white border-[#E8CCD5]'
                        }`}
                      >
                        {/* Card Image Header */}
                        <div className="relative h-40 bg-neutral-900 overflow-hidden group">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2E181D] to-[#181114]">
                              <Sparkles className="w-8 h-8 text-[#C57280]/40" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.cls}`}>
                              {catInfo.label}
                            </span>
                            {service.tag && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                                {service.tag}
                              </span>
                            )}
                          </div>

                          {/* Popular toggle on top right */}
                          <button
                            type="button"
                            onClick={() => handleTogglePopular(service)}
                            title={service.popular ? 'Снять метку Хит' : 'Сделать услугу Хитом'}
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                              service.popular
                                ? 'bg-amber-400 text-neutral-950 shadow-md'
                                : 'bg-black/50 text-neutral-300 hover:bg-black/80 border border-white/20'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${service.popular ? 'fill-current' : ''}`} />
                            <span>{service.popular ? 'Хит' : 'Обычная'}</span>
                          </button>

                          {/* Bottom duration & price overlay */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2 text-white">
                            <div className="flex items-center gap-1 text-[11px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                              <Clock className="w-3 h-3 text-[#C57280]" />
                              <span>{service.durationMinutes} мин</span>
                            </div>

                            <div className="text-right">
                              {service.priceOnConsultation ? (
                                <span className="text-xs font-bold bg-[#7A2434] px-2 py-0.5 rounded-lg shadow-xs">
                                  {service.priceLabel || 'По согласованию'}
                                </span>
                              ) : (
                                <span className="text-sm font-bold bg-black/75 px-2 py-0.5 rounded-lg border border-white/15">
                                  {service.priceFrom.toLocaleString('ru-RU')} ₽
                                  {service.priceTo ? ` – ${service.priceTo.toLocaleString('ru-RU')} ₽` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-serif font-bold text-sm sm:text-base line-clamp-1">
                              {service.name}
                            </h4>
                            <p className={`text-xs mt-1.5 line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                              {service.description}
                            </p>
                          </div>

                          {service.includedSteps && service.includedSteps.length > 0 && (
                            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-[#C57280]" />
                              <span>Включает {service.includedSteps.length} этапа(ов) процедуры</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-neutral-500/20 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-neutral-400 truncate">
                              ID: {service.id}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditService(service)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 cursor-pointer transition ${
                                  isDark
                                    ? 'border-[#382329] text-neutral-200 hover:bg-[#25171B]'
                                    : 'border-[#DEC8CF] text-[#423136] hover:bg-neutral-100'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#C57280]" />
                                <span>Изменить</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteService(service.id, service.name)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                                title="Удалить услугу"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STUDIO LOGO MANAGEMENT */}
          {activeTab === 'logo' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-500/20">
                <div>
                  <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#C57280]" />
                    <span>Официальный логотип студии MEO</span>
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                    Отображается в шапке, на главном экране (Hero), в модальном окне онлайн-записи и в подвале сайта.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition ${
                      isDark
                        ? 'border-[#382329] text-neutral-300 hover:bg-[#25171B]'
                        : 'border-[#DEC8CF] text-[#423136] hover:bg-neutral-100'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Сбросить к исходному ЛОГО.jpg</span>
                  </button>
                </div>
              </div>

              {logoSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{logoSuccessMsg}</span>
                </div>
              )}

              {/* Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Светлый фон */}
                <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-[#180F12] border-[#382329]' : 'bg-white border-[#E8CCD5]'
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider mb-4 text-[#C57280]">
                    Отображение на светлом фоне
                  </span>
                  <div className="w-64 h-64 bg-white p-3 rounded-2xl border border-neutral-200 shadow-md flex items-center justify-center">
                    <img
                      src={customLogoPreview}
                      alt="Превью логотипа MEO"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-3">
                    Чистый белый фон с органическими элементами и надписью MEO
                  </span>
                </div>

                {/* Темный фон */}
                <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-[#180F12] border-[#382329]' : 'bg-neutral-900 border-neutral-700 text-white'
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider mb-4 text-[#E5B5BE]">
                    Отображение в темной теме
                  </span>
                  <div className="w-64 h-64 bg-[#1F1417] p-3 rounded-2xl border border-[#C57280]/30 shadow-md flex items-center justify-center">
                    <div className="w-full h-full bg-white p-2 rounded-xl shadow-xs flex items-center justify-center">
                      <img
                        src={customLogoPreview}
                        alt="Превью логотипа MEO"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-3">
                    Элегантная белая плашка для идеальной четкости черных контуров и надписей
                  </span>
                </div>
              </div>

              {/* Upload Zone */}
              <div className={`p-6 rounded-2xl border ${
                isDark ? 'bg-[#150D10] border-[#382329]' : 'bg-[#FAF5F7] border-[#DEC8CF]'
              }`}>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#C57280]" />
                  <span>Загрузить оригинальный файл логотипа</span>
                </h4>
                <p className={`text-xs mb-4 ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
                  Поддерживаются форматы: <strong>.jpg</strong>, <strong>.webp</strong>, <strong>.png</strong>, <strong>.svg</strong>.
                  Рекомендуется квадратное разрешение (например, 1000 × 1000 пикселей).
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#7A2434] to-[#C57280] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Выбрать файл с устройства (ЛОГО.jpg)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>

                  <a
                    href="/meo_logo.png"
                    download="meo_logo.png"
                    className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                      isDark ? 'border-[#382329] text-neutral-300 hover:bg-[#25171B]' : 'border-[#DEC8CF] text-[#423136] hover:bg-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Скачать текущий файл логотипа</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BLOCK SLOT DIALOG MODAL */}
        {isBlockModalOpen && slotToBlock && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div
              className={`w-full max-w-md p-5 rounded-2xl border shadow-xl space-y-4 ${
                isDark ? 'bg-[#1A1014] border-[#382329] text-white' : 'bg-white border-[#E8CCD5] text-black'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3 border-neutral-500/20">
                <div className="flex items-center gap-2 font-bold font-serif text-base">
                  <PhoneCall className="w-4 h-4 text-[#C57280]" />
                  <span>Занять время {slotToBlock}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-500/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-3">
                <p className={isDark ? 'text-neutral-300' : 'text-[#423136]'}>
                  Укажите причину блокировки слота на <strong>{selectedDate}</strong>:
                </p>

                <div>
                  <label className="block font-bold mb-1">Причина:</label>
                  <select
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  >
                    <option value="Запись по телефону">Запись по телефону</option>
                    <option value="Запись через WhatsApp / Telegram">Запись через WhatsApp / Telegram</option>
                    <option value="Бронь администратора">Бронь администратора</option>
                    <option value="Технический перерыв / санитария">Технический перерыв / санитария</option>
                    <option value="Отпуск мастера">Отпуск мастера</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Примечание (имя клиента, телефон, услуга):</label>
                  <input
                    type="text"
                    placeholder="Например: Анна, +7 999 123-45-67 (ботокс)"
                    value={blockNote}
                    onChange={(e) => setBlockNote(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-500/20">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-500/30 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7A2434] hover:bg-[#B6465B] transition-colors cursor-pointer"
                >
                  Занять слот
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE / EDIT NEWS MODAL */}
        {isNewsModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div
              className={`w-full max-w-2xl p-5 sm:p-6 rounded-2xl border shadow-2xl my-auto space-y-4 max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-[#181114] border-[#382329] text-white' : 'bg-white border-[#E8CCD5] text-black'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3 border-neutral-500/20">
                <div className="flex items-center gap-2 font-bold font-serif text-lg">
                  <BookOpen className="w-5 h-5 text-[#C57280]" />
                  <span>{editingPost ? 'Редактирование статьи' : 'Новая статья для сайта'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Заголовок статьи *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Как подготовиться к чистке лица..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Категория:</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as NewsCategory)}
                      className={`w-full px-3 py-2 rounded-xl border outline-none font-medium ${
                        isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                      }`}
                    >
                      <option value="advice">Советы косметолога</option>
                      <option value="injections">Инъекции & Ботокс</option>
                      <option value="care">Коррекция тела & Массаж</option>
                      <option value="news">Новости студии</option>
                      <option value="promo">Акции & Бонусы</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Автор статьи:</label>
                    <input
                      type="text"
                      placeholder="Имя специалиста (например: Валерия)"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                      }`}
                    />
                  </div>
                </div>

                {/* Cover Image Selection: Direct File Upload or URL */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-[#150E11] border-[#382329]' : 'bg-[#FAF2F5] border-[#DEC8CF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-[#C57280]" />
                      <span>Обложка публикации *:</span>
                    </label>

                    {/* Mode toggle */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg border text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setFormImageMode('upload')}
                        className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition ${
                          formImageMode === 'upload'
                            ? 'bg-[#C57280] text-white'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Файл с устройства</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageMode('url')}
                        className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition ${
                          formImageMode === 'url'
                            ? 'bg-[#C57280] text-white'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Link className="w-3 h-3" />
                        <span>Ссылка / Галерея</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Direct File Upload */}
                  {formImageMode === 'upload' ? (
                    <div className="space-y-3">
                      <label
                        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center ${
                          isProcessingImage
                            ? 'opacity-50 pointer-events-none'
                            : isDark
                            ? 'border-[#382329] hover:border-[#C57280] bg-black/20 hover:bg-black/40'
                            : 'border-[#DEC8CF] hover:border-[#C57280] bg-white/60 hover:bg-white'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                        {isProcessingImage ? (
                          <div className="flex items-center gap-2 text-xs text-[#C57280]">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Сжатие и оптимизация фото...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-[#C57280]/20 flex items-center justify-center text-[#C57280]">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-[#C57280]">Нажмите для выбора файла</span> или
                              перетащите фото сюда
                            </div>
                            <span className="text-[10px] text-neutral-400">
                              PNG, JPG, JPEG, WEBP • Фото автоматически сожмется для мгновенной загрузки
                            </span>
                          </>
                        )}
                      </label>

                      {imageUploadError && (
                        <div className="text-[11px] text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{imageUploadError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Mode 2: By URL / Presets */
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="Вставьте ссылку на картинку (https://...)"
                        value={formCoverImage.startsWith('data:') ? '' : formCoverImage}
                        onChange={(e) => setFormCoverImage(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border outline-none text-xs ${
                          isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                        }`}
                      />

                      {/* Preset quick buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Быстрые фото:
                        </span>
                        {PHOTO_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormCoverImage(preset.url)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                              formCoverImage === preset.url
                                ? 'bg-[#C57280] text-white border-[#C57280]'
                                : isDark
                                ? 'bg-[#22171B] border-[#382329] text-neutral-300'
                                : 'bg-neutral-100 border-[#DEC8CF] text-black'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Preview if chosen */}
                  {formCoverImage && (
                    <div className="relative rounded-xl overflow-hidden border border-[#C57280]/40 max-h-48 group">
                      <img
                        src={formCoverImage}
                        alt="Превью обложки"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                        <span className="text-[11px] text-white font-medium drop-shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {formCoverImage.startsWith('data:') ? 'Файл загружен с устройства' : 'Фото выбрано'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setFormCoverImage('')}
                          className="px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Удалить фото</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1">Краткое описание (анонс на карточке):</label>
                  <textarea
                    rows={2}
                    placeholder="1-2 предложения, раскрывающие суть статьи..."
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none leading-relaxed ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Полный текст публикации *:</label>
                  <textarea
                    rows={7}
                    required
                    placeholder="Пишите текст статьи. Можно использовать переносы строк, дефисы для списков..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-sans leading-relaxed ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="w-4 h-4 accent-[#C57280] rounded"
                    />
                    <span className="font-semibold">Опубликовать на сайте сразу</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#C57280] rounded"
                    />
                    <span className="font-semibold">Пометить как «Топ»</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-500/20">
                  <button
                    type="button"
                    onClick={() => setIsNewsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-500/30 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7A2434] to-[#C57280] hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    {editingPost ? 'Сохранить изменения' : 'Опубликовать статью'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* CREATE / EDIT SERVICE MODAL */}
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div
              className={`w-full max-w-2xl p-5 sm:p-6 rounded-2xl border shadow-2xl my-auto space-y-4 max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-[#181114] border-[#382329] text-white' : 'bg-white border-[#E8CCD5] text-black'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3 border-neutral-500/20">
                <div className="flex items-center gap-2 font-bold font-serif text-lg">
                  <Sparkles className="w-5 h-5 text-[#C57280]" />
                  <span>{editingService ? `Редактирование услуги: ${editingService.name}` : 'Новая услуга в каталог MEO'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-500/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label className="block font-bold mb-1">Название процедуры *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Комбинированная чистка лица Holy Land"
                    value={formSrvName}
                    onChange={(e) => setFormSrvName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                {/* Category & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Категория:</label>
                    <select
                      value={formSrvCategory}
                      onChange={(e) => setFormSrvCategory(e.target.value as ServiceCategory)}
                      className={`w-full px-3 py-2 rounded-xl border outline-none font-medium ${
                        isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                      }`}
                    >
                      <option value="face">Лицо (чистки, пилинги, уход)</option>
                      <option value="body">Тело (массаж, коррекция фигуры)</option>
                      <option value="injections">Инъекции (ботулинотерапия, филлеры)</option>
                      <option value="posture">Осанка (здоровая спина, правка)</option>
                      <option value="packages">Комплексы (абонементы, комбо)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Длительность процедуры (минут) *:</label>
                    <input
                      type="number"
                      required
                      min={10}
                      step={5}
                      value={formSrvDuration}
                      onChange={(e) => setFormSrvDuration(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-xl border outline-none font-medium ${
                        isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                      }`}
                    />
                  </div>
                </div>

                {/* Pricing Type */}
                <div className={`p-3.5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#150E11] border-[#382329]' : 'bg-[#FAF2F5] border-[#DEC8CF]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Ценообразование:</span>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg border text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setFormSrvPriceType('fixed')}
                        className={`px-2.5 py-1 rounded cursor-pointer transition ${
                          formSrvPriceType === 'fixed'
                            ? 'bg-[#C57280] text-white'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Фиксированная цена
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSrvPriceType('consultation')}
                        className={`px-2.5 py-1 rounded cursor-pointer transition ${
                          formSrvPriceType === 'consultation'
                            ? 'bg-[#C57280] text-white'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        На консультации / Индивидуально
                      </button>
                    </div>
                  </div>

                  {formSrvPriceType === 'fixed' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Стоимость (₽) *:</label>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          placeholder="2500"
                          value={formSrvPriceFrom}
                          onChange={(e) => setFormSrvPriceFrom(Number(e.target.value))}
                          className={`w-full px-3 py-2 rounded-xl border outline-none ${
                            isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Верхняя планка цены (₽, опционально):</label>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          placeholder="например 3500"
                          value={formSrvPriceTo}
                          onChange={(e) => setFormSrvPriceTo(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border outline-none ${
                            isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Текст стоимости:</label>
                        <input
                          type="text"
                          placeholder="По согласованию"
                          value={formSrvPriceLabel}
                          onChange={(e) => setFormSrvPriceLabel(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border outline-none ${
                            isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Пояснение к стоимости:</label>
                        <input
                          type="text"
                          placeholder="Зависит от выбранного препарата и объема"
                          value={formSrvPriceNote}
                          onChange={(e) => setFormSrvPriceNote(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border outline-none ${
                            isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tag & Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Тег / Метка (опционально):</label>
                    <input
                      type="text"
                      placeholder="Например: Аппаратный массаж"
                      value={formSrvTag}
                      onChange={(e) => setFormSrvTag(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-4 pt-4 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formSrvPopular}
                        onChange={(e) => setFormSrvPopular(e.target.checked)}
                        className="w-4 h-4 accent-[#C57280] rounded"
                      />
                      <span className="font-semibold">Выделять как «Хит» ★</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formSrvIsInjectable}
                        onChange={(e) => setFormSrvIsInjectable(e.target.checked)}
                        className="w-4 h-4 accent-[#C57280] rounded"
                      />
                      <span className="font-semibold">Инъекционная процедура</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold mb-1">Описание услуги *:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Подробное описание процедуры, ожидаемый эффект, кому подходит..."
                    value={formSrvDescription}
                    onChange={(e) => setFormSrvDescription(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none resize-none leading-relaxed ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                {/* Steps (Multi-line) */}
                <div>
                  <label className="block font-bold mb-1">
                    Что входит в процедуру (каждый шаг с новой строки):
                  </label>
                  <textarea
                    rows={3}
                    placeholder={`Демакияж и очищение кожи\nУльтразвуковой пилинг\nУспокаивающая альгинатная маска\nФинальный крем с SPF-защитой`}
                    value={formSrvSteps}
                    onChange={(e) => setFormSrvSteps(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-mono text-xs leading-relaxed ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                {/* Photo Upload & Presets */}
                <div className={`p-3.5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#150E11] border-[#382329]' : 'bg-[#FAF2F5] border-[#DEC8CF]'}`}>
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-[#C57280]" />
                      <span>Фотография услуги:</span>
                    </label>

                    <div className="flex items-center gap-1 p-0.5 rounded-lg border text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setFormSrvImageMode('presets')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          formSrvImageMode === 'presets' ? 'bg-[#C57280] text-white' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Пресеты MEO
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSrvImageMode('upload')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          formSrvImageMode === 'upload' ? 'bg-[#C57280] text-white' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Загрузить файл
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSrvImageMode('url')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          formSrvImageMode === 'url' ? 'bg-[#C57280] text-white' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Ссылка URL
                      </button>
                    </div>
                  </div>

                  {formSrvImageMode === 'presets' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {PHOTO_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setFormSrvImage(preset.url)}
                          className={`relative rounded-xl overflow-hidden border-2 text-left cursor-pointer transition-all aspect-video group ${
                            formSrvImage === preset.url
                              ? 'border-[#C57280] ring-2 ring-[#C57280]/40'
                              : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-semibold text-white truncate leading-tight">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {formSrvImageMode === 'upload' && (
                    <label
                      className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center ${
                        isCompressingSrvImage
                          ? 'opacity-50 pointer-events-none'
                          : isDark
                          ? 'border-[#382329] hover:border-[#C57280] bg-black/20 hover:bg-black/40'
                          : 'border-[#DEC8CF] hover:border-[#C57280] bg-white/60 hover:bg-white'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleServiceImageUpload}
                        className="sr-only"
                      />
                      {isCompressingSrvImage ? (
                        <div className="flex items-center gap-2 text-xs text-[#C57280]">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Сжатие и оптимизация фото...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#C57280]/20 flex items-center justify-center text-[#C57280]">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-xs">
                            <span className="font-bold text-[#C57280]">Нажмите для выбора файла</span> или перетащите фото сюда
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            PNG, JPG, WEBP • Автоматическое сжатие для быстродействия
                          </span>
                        </>
                      )}
                    </label>
                  )}

                  {formSrvImageMode === 'url' && (
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formSrvImage}
                        onChange={(e) => setFormSrvImage(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border outline-none ${
                          isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                        }`}
                      />
                    </div>
                  )}

                  {/* Image Preview */}
                  {formSrvImage && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-neutral-500/20 shrink-0 bg-neutral-900">
                        <img
                          src={formSrvImage}
                          alt="Предпросмотр"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PHOTO_PRESETS[0].url;
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        Предпросмотр обложки услуги. Будет отображаться в карточке каталога и модалке записи.
                      </span>
                    </div>
                  )}
                </div>

                {/* VK Link */}
                <div>
                  <label className="block font-bold mb-1">Ссылка на пост или товар ВКонтакте (опционально):</label>
                  <input
                    type="url"
                    placeholder="https://vk.ru/market-241612312?w=product-..."
                    value={formSrvVkUrl}
                    onChange={(e) => setFormSrvVkUrl(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-[#150F11] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-black'
                    }`}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-500/20">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-500/30 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7A2434] to-[#C57280] hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    {editingService ? 'Сохранить изменения' : 'Добавить услугу в каталог'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
