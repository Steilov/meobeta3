import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Clock,
  Sparkles,
  Scissors,
  HandMetal,
  Eye,
  Smile,
  Check,
  Plus,
  Calendar,
  Layers,
  List,
  Grid,
  Info,
  X,
  ArrowRight,
  ChevronRight,
  Star
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { ServiceCategory, ServiceItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { getStoredServices } from '../utils/servicesStorage';

interface ServicesSectionProps {
  onSelectServiceForBooking: (serviceId: string, additionalServiceIds?: string[]) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectServiceForBooking }) => {
  const { isDark } = useTheme();
  const [services, setServices] = useState<ServiceItem[]>(getStoredServices);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'budget' | 'four_hands'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Multi-service Visit Builder Cart
  const [cartServiceIds, setCartServiceIds] = useState<string[]>([]);
  // Detail modal
  const [activeDetailService, setActiveDetailService] = useState<ServiceItem | null>(null);

  const servicesTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleServicesUpdate = () => {
      setServices(getStoredServices());
    };
    window.addEventListener('meo_services_updated', handleServicesUpdate);
    return () => {
      window.removeEventListener('meo_services_updated', handleServicesUpdate);
    };
  }, []);

  const handleCategoryClick = (catId: ServiceCategory | 'all') => {
    setSelectedCategory(catId);
    setQuickFilter('all');
    setTimeout(() => {
      if (servicesTargetRef.current) {
        const headerOffset = 80;
        const elementPosition = servicesTargetRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setSelectedCategory(custom.detail as ServiceCategory | 'all');
        setQuickFilter('all');
      }
    };
    window.addEventListener('meo-select-category', handleCustomEvent);
    window.addEventListener('meo_select_category', handleCustomEvent);
    window.addEventListener('tefi-select-category', handleCustomEvent);
    window.addEventListener('tefi_select_category', handleCustomEvent);
    return () => {
      window.removeEventListener('meo-select-category', handleCustomEvent);
      window.removeEventListener('meo_select_category', handleCustomEvent);
      window.removeEventListener('tefi-select-category', handleCustomEvent);
      window.removeEventListener('tefi_select_category', handleCustomEvent);
    };
  }, []);

  const categories: {
    id: ServiceCategory | 'all';
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
    count: number;
  }[] = [
    { id: 'all', label: 'Все процедуры', sublabel: 'каталог MEO', icon: Grid, count: services.length },
    { id: 'body', label: 'ТЕЛО', sublabel: 'коррекция & похудение', icon: Sparkles, count: services.filter((s) => s.category === 'body').length },
    { id: 'face', label: 'ЛИЦО', sublabel: 'чистки, пилинги & уход', icon: Smile, count: services.filter((s) => s.category === 'face').length },
    { id: 'injections', label: 'ИНЪЕКЦИИ', sublabel: 'контурная пластика & ботокс', icon: Sparkles, count: services.filter((s) => s.category === 'injections').length },
    { id: 'posture', label: 'ОСАНКА', sublabel: 'здоровая спина & массаж', icon: Layers, count: services.filter((s) => s.category === 'posture').length },
    { id: 'packages', label: 'КОМПЛЕКСЫ', sublabel: 'абонементы & комбо', icon: Star, count: services.filter((s) => s.category === 'packages').length },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        (service.tag && service.tag.toLowerCase().includes(q));

      let matchesQuick = true;
      if (quickFilter === 'popular') {
        matchesQuick = !!service.popular;
      } else if (quickFilter === 'budget') {
        matchesQuick = !service.priceOnConsultation && service.priceFrom > 0 && service.priceFrom <= 2000;
      } else if (quickFilter === 'four_hands') {
        matchesQuick = service.category === 'packages';
      }

      return matchesCategory && matchesSearch && matchesQuick;
    });
  }, [services, selectedCategory, searchQuery, quickFilter]);

  const cartServices = useMemo(() => {
    return cartServiceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is ServiceItem => Boolean(s));
  }, [cartServiceIds, services]);

  const hasConsultationInCart = useMemo(() => {
    return cartServices.some((s) => s.priceOnConsultation);
  }, [cartServices]);

  const totalCartPrice = useMemo(() => {
    return cartServices.reduce((sum, s) => sum + s.priceFrom, 0);
  }, [cartServices]);

  const totalCartDuration = useMemo(() => {
    return cartServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [cartServices]);

  const toggleServiceInCart = (serviceId: string) => {
    setCartServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleBookCart = () => {
    if (cartServiceIds.length === 0) return;
    const [primary, ...additional] = cartServiceIds;
    onSelectServiceForBooking(primary, additional);
  };

  return (
    <section
      id="services"
      className={`py-16 lg:py-24 border-y transition-colors scroll-mt-16 ${
        isDark
          ? 'bg-[#0c0c10] border-[#27272A] text-white'
          : 'bg-[#FBF9FA] border-[#DEC8CF] text-[#1A1014]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Minimalist Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-neutral-500/20 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C57280]" />
              <span className={isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}>каталог & цены</span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-[#190F13]'
            }`}>
              Процедуры{' '}
              <span className="text-[#C57280]">
                MEO
              </span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className={`text-xs sm:text-sm max-w-md ${isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}`}>
              Все 18 сертифицированных процедур из официального каталога студии MEO.
            </p>
            <a
              href="https://vk.ru/uslugi-218391917"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 self-start ${
                isDark
                  ? 'border-[#382329] bg-[#25181C] text-[#E8A5B2] hover:bg-[#382329]'
                  : 'border-[#DEC8CF] bg-white text-[#7A2434] hover:text-[#B6465B] hover:bg-[#FCEEF1] shadow-xs'
              }`}
            >
              <span>Каталог VK</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* Minimal Control Bar: Search + Quick Tags + View Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="glass-liquid-card p-3.5 sm:p-5 rounded-2xl border mb-6 sm:mb-8 transition-colors"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-neutral-500' : 'text-[#6E545C]'
              }`} />
              <input
                type="text"
                placeholder="Поиск по процедурам: пилинг, чистка, вакуумный массаж, кавитация..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition-colors ${
                  isDark
                    ? 'bg-[#25181C] border-[#382329] text-white placeholder-neutral-500 focus:border-[#C57280]'
                    : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder-[#6E545C] focus:border-[#B6465B] focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6E545C] hover:text-[#190F13]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold uppercase tracking-wider pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  quickFilter === 'all'
                    ? 'bg-[#C57280] text-white border-[#C57280] shadow-xs'
                    : isDark
                      ? 'border-[#382329] text-neutral-400 hover:text-white hover:bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4] hover:bg-[#F0E4E8]'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setQuickFilter('popular')}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                  quickFilter === 'popular'
                    ? 'bg-[#C57280] text-white border-[#C57280] shadow-xs'
                    : isDark
                      ? 'border-[#382329] text-neutral-400 hover:text-white hover:bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4] hover:bg-[#F0E4E8]'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Хиты</span>
              </button>
              <button
                onClick={() => setQuickFilter('budget')}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  quickFilter === 'budget'
                    ? 'bg-[#C57280] text-white border-[#C57280] shadow-xs'
                    : isDark
                      ? 'border-[#382329] text-neutral-400 hover:text-white hover:bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4] hover:bg-[#F0E4E8]'
                }`}
              >
                До 2 000 ₽
              </button>
              <button
                onClick={() => setQuickFilter('four_hands')}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  quickFilter === 'four_hands'
                    ? 'bg-[#C57280] text-white border-[#C57280] shadow-xs'
                    : isDark
                      ? 'border-[#382329] text-neutral-400 hover:text-white hover:bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4] hover:bg-[#F0E4E8]'
                }`}
              >
                Абонементы
              </button>

              {/* View mode toggle */}
              <div className={`flex items-center ml-1 border rounded-xl overflow-hidden shrink-0 ${
                isDark ? 'border-[#382329]' : 'border-[#DEC8CF]'
              }`}>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 transition-colors cursor-pointer ${
                    viewMode === 'cards'
                      ? isDark ? 'bg-[#382329] text-white' : 'bg-[#FCEEF1] text-[#7A2434]'
                      : isDark ? 'text-neutral-400 hover:text-white' : 'text-[#554047] hover:text-[#190F13]'
                  }`}
                  title="Карточки"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? isDark ? 'bg-[#382329] text-white' : 'bg-[#FCEEF1] text-[#7A2434]'
                      : isDark ? 'text-neutral-400 hover:text-white' : 'text-[#554047] hover:text-[#190F13]'
                  }`}
                  title="Список"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Beautiful Category Plates ("Красивые плашки с выбором услуг") */}
          <div className="pt-4 border-t border-neutral-500/20 mt-4">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>
                Направления услуг:
              </span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-neutral-400' : 'text-[#4E393F]'}`}>
                нажмите для мгновенной фильтрации
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {categories.map((cat, catIndex) => {
                const isActive = selectedCategory === cat.id;
                const IconComponent = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: catIndex * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`relative p-3 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group ${
                      isActive
                        ? isDark
                          ? 'bg-[#25181C] border-[#C57280] shadow-[0_8px_24px_rgba(197,114,128,0.25)] ring-1 ring-[#C57280]/40'
                          : 'bg-white border-[#C57280] shadow-[0_8px_20px_rgba(197,114,128,0.18)] ring-2 ring-[#C57280]/30'
                        : isDark
                          ? 'bg-[#181013] border-[#382329] hover:border-[#C57280]/60 hover:bg-[#201418]'
                          : 'bg-white border-[#DEC8CF] hover:border-[#B6465B] hover:bg-[#F8F2F4] shadow-xs'
                    }`}
                  >
                    {/* Active accent top bar */}
                    {isActive && (
                      <span className="absolute top-0 inset-x-0 h-1 bg-[#C57280]" />
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-[#C57280] text-white'
                          : isDark ? 'bg-[#25181C] text-neutral-400 group-hover:text-white' : 'bg-[#FCEEF1] text-[#7A2434] group-hover:bg-[#C57280] group-hover:text-white'
                      }`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? isDark ? 'bg-[#C57280]/20 text-[#E8A5B2]' : 'bg-[#FCEEF1] text-[#7A2434]'
                          : isDark ? 'bg-[#25181C] text-neutral-400' : 'bg-[#F0E4E8] text-[#2E1D22]'
                      }`}>
                        {cat.count}
                      </span>
                    </div>

                    <div>
                      <div className={`font-serif text-xs font-bold leading-tight line-clamp-1 ${
                        isActive
                          ? isDark ? 'text-white' : 'text-[#190F13]'
                          : isDark ? 'text-neutral-200 group-hover:text-white' : 'text-[#190F13]'
                      }`}>
                        {cat.label}
                      </div>
                      <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isActive
                          ? isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434] font-bold'
                          : isDark ? 'text-neutral-400' : 'text-[#3E2930]'
                      }`}>
                        {cat.sublabel}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Multi-service Visit Builder Bar (if items are in cart) */}
        {cartServiceIds.length > 0 && (
          <div
            className={`sticky top-20 z-30 mb-8 p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300 shadow-xl ${
              isDark
                ? 'bg-[#1D1417] border-[#C57280] text-[#F7F1F2]'
                : 'bg-[#FFF5F8] border-[#C57280] text-[#2A161D]'
            }`}
          >
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 bg-[#C57280] text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Собрано услуг: {cartServiceIds.length}
                </div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#554047]'}`}>
                  {hasConsultationInCart ? (
                    totalCartPrice > 0 ? (
                      <>
                        Итого от <strong className={isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}>{totalCartPrice.toLocaleString('ru-RU')} ₽</strong>{' '}
                        <span className="text-[11px] opacity-90">+ расчет по препарату</span> • ~{totalCartDuration} мин
                      </>
                    ) : (
                      <>
                        Итого: <strong className={isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}>По согласованию (подбор препарата)</strong> • ~{totalCartDuration} мин
                      </>
                    )
                  ) : (
                    <>
                      Итого от <strong className={isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}>{totalCartPrice.toLocaleString('ru-RU')} ₽</strong> • ~{totalCartDuration} мин
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setCartServiceIds([])}
                className={`px-3 py-2 text-xs cursor-pointer ${
                  isDark ? 'text-neutral-400 hover:text-white' : 'text-[#7A2434] hover:text-[#190F13]'
                }`}
              >
                Очистить
              </button>
              <button
                onClick={handleBookCart}
                className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md bg-[#C57280] hover:bg-[#A84758] text-white"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Забронировать визит</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Catalog Items Container with scroll target */}
        <div ref={servicesTargetRef} id="services-catalog-list" className="scroll-mt-24">
        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border p-6 max-w-md mx-auto ${
            isDark ? 'bg-[#121217] border-[#27272A]' : 'bg-white border-[#FCE7F3]'
          }`}>
            <Search className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            <h3 className="font-display font-bold text-sm">Ничего не найдено</h3>
            <p className="text-xs text-neutral-500 mt-1">Попробуйте изменить запрос</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setQuickFilter('all');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#27272A] text-white hover:bg-neutral-600"
            >
              Сбросить
            </button>
          </div>
        )}

        {/* Cards View */}
        {filteredServices.length > 0 && viewMode === 'cards' && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {filteredServices.map((service, index) => {
              const isInCart = cartServiceIds.includes(service.id);
              const isHit = service.popular || service.tag?.toLowerCase() === 'хит';
              const extraTag = service.tag && service.tag.toLowerCase() !== 'хит' ? service.tag : null;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{
                    duration: 0.35,
                    ease: 'easeOut',
                  }}
                  className={`group rounded-2xl p-3 sm:p-5 sm:p-6 border transition-all duration-300 md:hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden glass-liquid-card ${
                    isDark
                      ? isInCart
                        ? 'border-[#C57280] ring-2 ring-[#C57280]/40 shadow-[0_0_24px_rgba(197,114,128,0.22)]'
                        : 'hover:border-[#C57280]/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_20px_rgba(197,114,128,0.1)]'
                      : isInCart
                        ? 'border-[#C57280] ring-2 ring-[#C57280]/30 shadow-[0_0_20px_rgba(197,114,128,0.18)]'
                        : 'hover:border-[#B6465B] shadow-xs hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {/* Subtle top accent shimmer line on hover */}
                  <div className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-transparent via-[#C57280] to-transparent z-10" />

                  {/* Photo Banner if available from VK */}
                  {service.image && (
                    <div className="relative w-[calc(100%+1.25rem)] -mx-2.5 -mt-2.5 sm:w-[calc(100%+2.5rem)] sm:-mx-5 sm:-mt-5 md:w-[calc(100%+3rem)] md:-mx-6 md:-mt-6 mb-2 sm:mb-4 h-28 sm:h-44 overflow-hidden rounded-t-2xl bg-neutral-900/20 shrink-0">
                      <img
                        src={service.image}
                        alt={service.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 flex-wrap z-10">
                        {isHit && (
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm bg-[#C57280] text-white">
                            <Sparkles className="w-2.5 h-2.5" />
                            ХИТ
                          </span>
                        )}
                        {extraTag && (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-black/55 backdrop-blur-xs text-white border border-white/20">
                            {extraTag}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    {/* Top Badges (if no image) & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1.5 sm:mb-3">
                      {!service.image && (
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          {isHit && (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs bg-[#C57280] text-white">
                              <Sparkles className="w-2.5 h-2.5" />
                              ХИТ
                            </span>
                          )}
                          {extraTag && (
                            <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                              isDark
                                ? 'bg-white/6 border border-white/10 text-neutral-300'
                                : 'bg-[#FCEEF1] border border-[#DEC8CF] text-[#7A2434]'
                            }`}>
                              {extraTag}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-left sm:text-right shrink-0 sm:pl-2 sm:ml-auto">
                        {service.priceOnConsultation ? (
                          <div className="flex flex-col sm:items-end">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-serif text-[11px] sm:text-xs md:text-sm font-bold tracking-tight shadow-xs ${
                              isDark ? 'bg-[#C57280]/20 text-[#E8A5B2] border border-[#C57280]/35' : 'bg-[#FCEEF1] text-[#7A2434] border border-[#DEC8CF]'
                            }`}>
                              {service.priceLabel || 'По согласованию'}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-medium mt-0.5 ${
                              isDark ? 'text-neutral-400' : 'text-[#755E65]'
                            }`}>
                              расчет по препарату
                            </span>
                          </div>
                        ) : service.priceTo ? (
                          <div className="flex flex-col sm:items-end">
                            <span className={`font-serif text-xs sm:text-base md:text-lg font-extrabold tracking-tight ${
                              isDark ? 'text-[#C57280]' : 'text-[#7A2434]'
                            }`}>
                              {service.priceFrom.toLocaleString('ru-RU')} – {service.priceTo.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className={`text-[10px] sm:text-[11px] font-bold mr-0.5 sm:mr-1 ${
                              isDark ? 'text-neutral-400' : 'text-[#554047]'
                            }`}>от</span>
                            <span className={`font-serif text-sm sm:text-lg md:text-xl font-extrabold tracking-tight ${
                              isDark ? 'text-[#C57280]' : 'text-[#7A2434]'
                            }`}>
                              {service.priceFrom.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`font-serif text-xs sm:text-base md:text-lg font-bold leading-snug transition-colors line-clamp-2 ${
                      isDark
                        ? 'text-white group-hover:text-[#C57280]'
                        : 'text-[#190F13] group-hover:text-[#B6465B]'
                    }`}>
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className={`text-[11px] sm:text-xs mt-1 sm:mt-2 leading-snug sm:leading-relaxed line-clamp-2 min-h-0 sm:min-h-[34px] ${
                      isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'
                    }`}>
                      {service.description}
                    </p>

                    {service.priceOnConsultation && (
                      <div className={`mt-2 p-1.5 rounded-lg text-[10px] sm:text-[11px] flex items-center gap-1.5 ${
                        isDark ? 'bg-[#25171B] border border-[#C57280]/25 text-[#E5B5BE]' : 'bg-[#FAF0F2] border border-[#EACCD4] text-[#702636]'
                      }`}>
                        <Sparkles className="w-3 h-3 shrink-0 text-[#C57280]" />
                        <span className="truncate">Препарат и объем рассчитываются на очной консультации</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className={`pt-2 sm:pt-3.5 mt-2 sm:mt-3.5 border-t ${
                    isDark ? 'border-[#382329]' : 'border-[#DEC8CF]'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs mb-2 sm:mb-3.5">
                      <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold ${
                        isDark
                          ? 'text-neutral-400 bg-white/4 border border-white/5'
                          : 'text-[#190F13] bg-[#F5EFF2] border border-[#DEC8CF]'
                      }`}>
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C57280]" />
                        <span>~{service.durationMinutes} мин</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveDetailService(service)}
                        className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer group/comp ${
                          isDark
                            ? 'text-neutral-400 hover:text-white hover:underline'
                            : 'text-[#2E1D22] hover:text-[#B6465B] hover:underline'
                        }`}
                      >
                        <span className="hidden sm:inline">Состав услуги</span>
                        <span className="sm:hidden">Инфо</span>
                        <ChevronRight className="w-3 h-3 transition-transform group-hover/comp:translate-x-0.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => toggleServiceInCart(service.id)}
                        className={`py-2 sm:py-2.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 min-h-[40px] ${
                          isInCart
                            ? 'bg-[#C57280] text-white border-[#C57280] shadow-xs'
                            : isDark
                              ? 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:border-neutral-500'
                              : 'bg-[#F8F2F4] hover:bg-[#EFE4E8] border-[#DEC8CF] text-[#190F13]'
                        }`}
                      >
                        {isInCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isInCart ? 'В визите' : '+ В визит'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectServiceForBooking(service.id)}
                        className={`py-2 sm:py-2.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 group/btn min-h-[40px] ${
                          isDark
                            ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-110 shadow-lg shadow-[#C57280]/20'
                            : 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 shadow-md shadow-[#C57280]/25'
                        }`}
                      >
                        <span>Запись</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Mode 2: Table View */}
        {filteredServices.length > 0 && viewMode === 'table' && (
          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-[#121217] border-[#27272A]' : 'bg-white border-[#DEC8CF] shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                    isDark ? 'bg-[#181820] text-neutral-400 border-[#27272A]' : 'bg-[#F5EFF2] text-[#190F13] border-[#DEC8CF]'
                  }`}>
                    <th className="py-3 px-4">Услуга</th>
                    <th className="py-3 px-3 hidden sm:table-cell">Время</th>
                    <th className="py-3 px-3">Цена</th>
                    <th className="py-3 px-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#27272A]' : 'divide-[#DEC8CF]'}`}>
                  {filteredServices.map((service) => {
                    const isInCart = cartServiceIds.includes(service.id);
                    return (
                      <tr key={service.id} className={isDark ? 'hover:bg-white/5' : 'hover:bg-[#FAF6F8]'}>
                        <td className="py-3 px-4">
                          <div className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                            <span>{service.name}</span>
                            {service.popular && (
                              <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                                isDark ? 'bg-[#C57280]/20 text-[#C57280]' : 'bg-[#FCEEF1] text-[#7A2434] border border-[#DEC8CF]'
                              }`}>
                                Хит
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] truncate max-w-sm mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            {service.description}
                          </div>
                        </td>
                        <td className={`py-3 px-3 hidden sm:table-cell font-medium ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                          ~{service.durationMinutes} мин
                        </td>
                        <td className="py-3 px-3 font-bold whitespace-nowrap">
                          {service.priceOnConsultation ? (
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}`}>
                                {service.priceLabel || 'По согласованию'}
                              </span>
                              <span className={`text-[10px] font-normal ${isDark ? 'text-neutral-400' : 'text-[#6C535A]'}`}>
                                подбор препарата
                              </span>
                            </div>
                          ) : service.priceTo ? (
                            <span className={isDark ? 'text-[#C57280]' : 'text-[#7A2434]'}>{service.priceFrom.toLocaleString('ru-RU')} – {service.priceTo.toLocaleString('ru-RU')} ₽</span>
                          ) : (
                            <span className={isDark ? 'text-[#C57280]' : 'text-[#7A2434]'}>от {service.priceFrom.toLocaleString('ru-RU')} ₽</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleServiceInCart(service.id)}
                              className={`p-1.5 rounded-md border text-xs cursor-pointer ${
                                isInCart
                                  ? 'bg-[#C57280] text-white border-[#C57280]'
                                  : isDark
                                    ? 'border-neutral-500/30 text-neutral-300'
                                    : 'border-[#DEC8CF] text-[#190F13] hover:bg-[#F8F2F4]'
                              }`}
                              title={isInCart ? 'Убрать' : 'Добавить в визит'}
                            >
                              {isInCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onSelectServiceForBooking(service.id)}
                              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md cursor-pointer ${
                                isDark
                                  ? 'bg-white text-[#09090b] hover:bg-[#C57280] hover:text-white'
                                  : 'bg-[#C57280] text-white hover:bg-[#A84758]'
                              }`}
                            >
                              Записаться
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>

      </div>

      {/* Service Detail Modal */}
      {activeDetailService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border relative animate-in fade-in duration-200 ${
            isDark ? 'bg-[#1D1417] border-[#382329] text-[#F7F1F2]' : 'bg-white border-[#DEC8CF] text-[#190F13]'
          }`}>
            <button
              onClick={() => setActiveDetailService(null)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 cursor-pointer transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>

            {activeDetailService.image && (
              <div className="relative w-full h-52 -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-2xl bg-neutral-900/20" style={{ width: 'calc(100% + 3rem)' }}>
                <img
                  src={activeDetailService.image}
                  alt={activeDetailService.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1D1417] via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C57280]">
                {activeDetailService.category === 'body' ? 'Тело' : activeDetailService.category === 'face' ? 'Лицо' : activeDetailService.category === 'posture' ? 'Осанка' : 'Комплекс'}
              </span>
              {activeDetailService.popular && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#C57280] text-white">
                  ХИТ
                </span>
              )}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
              {activeDetailService.name}
            </h3>

            <div className="flex items-center flex-wrap gap-4 text-xs mt-2.5 pb-3 border-b border-neutral-500/20">
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                <Clock className="w-3.5 h-3.5 text-[#C57280]" />
                Длительность: ~{activeDetailService.durationMinutes} мин
              </span>
              <span>
                Стоимость:{' '}
                {activeDetailService.priceOnConsultation ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                    isDark ? 'bg-[#C57280]/20 text-[#E8A5B2]' : 'bg-[#FCEEF1] text-[#7A2434]'
                  }`}>
                    {activeDetailService.priceLabel || 'По согласованию'}
                  </span>
                ) : (
                  <strong className={isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}>
                    {activeDetailService.priceTo
                      ? `${activeDetailService.priceFrom.toLocaleString('ru-RU')} – ${activeDetailService.priceTo.toLocaleString('ru-RU')} ₽`
                      : `от ${activeDetailService.priceFrom.toLocaleString('ru-RU')} ₽`}
                  </strong>
                )}
              </span>
            </div>

            {activeDetailService.priceOnConsultation && (
              <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-[#25171B] border-[#C57280]/30 text-[#E5B5BE]' : 'bg-[#FAF0F3] border-[#E8CCD5] text-[#7A2434]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C57280]" />
                  <span>Индивидуальный расчет стоимости</span>
                </div>
                <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-[#3E252D]'}`}>
                  {activeDetailService.priceNote || 'Стоимость не фиксирована, так как зависит от выбранного сертифицированного препарата, зоны коррекции и необходимого объема (мл/ед). Препарат подбирается строго индивидуально на очной консультации.'}
                </p>
              </div>
            )}

            <div className={`text-xs sm:text-sm mt-3.5 leading-relaxed whitespace-pre-line ${
              isDark ? 'text-neutral-300' : 'text-[#2E1D22]'
            }`}>
              {activeDetailService.description}
            </div>

            {activeDetailService.vkUrl && (
              <div className="mt-3.5">
                <a
                  href={activeDetailService.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#7A2434] hover:text-[#B6465B] hover:underline font-bold"
                >
                  <span>Смотреть услугу во ВКонтакте</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {activeDetailService.includedSteps && activeDetailService.includedSteps.length > 0 && (
              <div className={`mt-4 p-3 rounded-xl border ${
                isDark ? 'bg-[#25181C] border-[#382329]' : 'bg-[#F8F2F4] border-[#DEC8CF]'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-neutral-400' : 'text-[#2E1D22]'
                }`}>
                  Этапы процедуры:
                </div>
                <div className="space-y-1.5 text-xs">
                  {activeDetailService.includedSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 bg-[#C57280] text-white">
                        {idx + 1}
                      </span>
                      <span className={isDark ? 'text-neutral-200' : 'text-[#190F13] font-medium'}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-neutral-500/20 flex gap-2">
              <button
                onClick={() => {
                  toggleServiceInCart(activeDetailService.id);
                }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  cartServiceIds.includes(activeDetailService.id)
                    ? 'bg-[#C57280] text-white border-[#C57280]'
                    : isDark
                      ? 'border-[#382329] text-white hover:bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:bg-[#FCEEF1]'
                }`}
              >
                {cartServiceIds.includes(activeDetailService.id) ? 'В визите' : '+ Добавить в визит'}
              </button>

              <button
                onClick={() => {
                  const sId = activeDetailService.id;
                  setActiveDetailService(null);
                  onSelectServiceForBooking(sId);
                }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-white text-[#09090b] hover:bg-[#C57280] hover:text-white'
                    : 'bg-[#C57280] text-white hover:bg-[#A84758]'
                }`}
              >
                <span>Записаться</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
