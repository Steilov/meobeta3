import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Phone,
  Calendar,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  MapPin,
  Star,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';
import { MeoLogo } from './MeoLogo';
import headerMeoLogoImg from '../assets/images/regenerated_image_1789849925733.png';
import { scrollToSection } from '../utils/navigation';
import { ServiceCategory } from '../types';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  bookingsCount: number;
  onOpenAdminAuth?: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenMyBookings,
  bookingsCount,
  onOpenAdminAuth,
  isAdminLoggedIn,
  onOpenAdminPanel,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const lastScrollY = React.useRef(0);

  // 5-click logo counter to trigger admin password modal
  const logoClicksRef = React.useRef(0);
  const logoTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    scrollToSection('top');
    if (logoTimerRef.current) {
      clearTimeout(logoTimerRef.current);
    }
    logoClicksRef.current += 1;
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      }
      return;
    }
    logoTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 2500);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Keep header visible when mobile menu is open
      if (mobileMenuOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // If at or near top of page, always show header
      if (currentScrollY <= 40) {
        setIsVisible(true);
      } else {
        const delta = currentScrollY - lastScrollY.current;
        // Scroll DOWN by more than 8px -> hide header
        if (delta > 8) {
          setIsVisible(false);
        } else if (delta < -8) {
          // Scroll UP by more than 8px -> reveal header
          setIsVisible(true);
        }
      }

      setIsScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'услуги и цены', href: '#services' },
    { name: 'новости', href: '#news' },
    { name: 'направления', href: '#pillars' },
    { name: 'о студии', href: '#about' },
    { name: 'результаты', href: '#portfolio' },
    { name: 'отзывы', href: '#reviews' },
    { name: 'контакты', href: '#contacts' },
  ];

  const quickServiceLinks: { name: string; category: ServiceCategory }[] = [
    { name: 'ТЕЛО: Коррекция фигуры', category: 'body' },
    { name: 'ЛИЦО: Косметология', category: 'face' },
    { name: 'ИНЪЕКЦИИ: Контурная пластика & Ботокс', category: 'injections' },
    { name: 'ОСАНКА: Здоровая спина', category: 'posture' },
    { name: 'КОМПЛЕКСЫ: Абонементы', category: 'packages' },
  ];

  const handleNavClick = (href: string, category?: ServiceCategory) => {
    setMobileMenuOpen(false);
    scrollToSection(href, { category, delay: 100 });
  };

  return (
    <div
      className={`sticky top-0 z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
      }`}
    >
      {/* 
        ========================================================================
        1. TOP ANNOUNCEMENT & STATUS RAIL (LIQUID GLASS FOR PC & MOBILE)
        ========================================================================
      */}

      {/* Desktop & Tablet Top Rail */}
      <div className="hidden md:block glass-top-bar border-b transition-colors py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11.5px]">
          {/* Left: Interactive Address & Operating Hours in Liquid Glass Pills */}
          <div className="flex items-center gap-2.5">
            {/* Address Pill */}
            <a
              href={SALON_INFO.yandexMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-liquid-pill inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold transition-all hover:scale-[1.02] active:scale-98 group cursor-pointer"
              title="Открыть Яндекс Карты"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C57280] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C57280]" />
              </span>
              <MapPin className="w-3.5 h-3.5 text-[#C57280] transition-transform group-hover:scale-110" />
              <span className={isDark ? 'text-[#F2E5E8]' : 'text-[#190F13]'}>
                Воронеж, ул. 9 Января, 233/40
              </span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Operating Hours Pill */}
            <div className="glass-liquid-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-[#C57280]" />
              <span className={`font-semibold ${isDark ? 'text-[#F2E5E8]' : 'text-[#190F13]'}`}>
                Ежедневно 10:00 — 22:00
              </span>
              <span className={`text-[10.5px] ${isDark ? 'text-[#C5B0B5]' : 'text-[#684C55]'}`}>
                (по записи с 08:30)
              </span>
            </div>
          </div>

          {/* Right: Yandex Maps High Rating & One-Tap Studio Contact */}
          <div className="flex items-center gap-2.5">
            {/* Yandex Rating Pill */}
            <a
              href={SALON_INFO.yandexMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-liquid-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-98 group cursor-pointer"
              title="Рейтинг 5.0 на Яндекс Картах"
            >
              <Star className="w-3.5 h-3.5 fill-[#E5A93C] text-[#E5A93C] transition-transform group-hover:rotate-12" />
              <span className={isDark ? 'text-[#F2E5E8]' : 'text-[#190F13]'}>
                Яндекс Карты
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#C57280]/15 text-[#C57280]">
                5.0 ★
              </span>
            </a>

            {/* Direct Phone Call Pill */}
            <a
              href={`tel:${SALON_INFO.phoneMobileClean}`}
              className="glass-liquid-pill inline-flex items-center gap-2 px-3.5 py-1 rounded-full font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-98 group cursor-pointer"
              title="Позвонить в студию"
            >
              <Phone className="w-3.5 h-3.5 text-[#C57280] transition-transform group-hover:scale-110" />
              <span className={`transition-colors ${isDark ? 'text-white group-hover:text-[#F29CAE]' : 'text-[#190F13] group-hover:text-[#B6465B]'}`}>
                {SALON_INFO.phoneMobile}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Ultra-Compact Status Strip (Liquid Glass) */}
      <div className="md:hidden glass-top-bar border-b py-1 px-3 transition-colors overflow-hidden">
        <div className="flex items-center justify-between gap-2 text-[11px] max-w-full">
          {/* Address with Map link */}
          <a
            href={SALON_INFO.yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-liquid-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold shrink min-w-0 active:scale-95 cursor-pointer"
            title="Открыть на Яндекс Картах"
          >
            <MapPin className="w-3 h-3 text-[#C57280] shrink-0" />
            <span className={`truncate text-[10.5px] ${isDark ? 'text-[#F2E5E8]' : 'text-[#190F13]'}`}>
              ул. 9 Января, 233/40
            </span>
          </a>

          {/* Rating Pill */}
          <a
            href={SALON_INFO.yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-liquid-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10.5px] shrink-0 active:scale-95 cursor-pointer"
            title="Рейтинг 5.0 на Яндекс Картах"
          >
            <Star className="w-3 h-3 fill-[#E5A93C] text-[#E5A93C]" />
            <span className="text-[#C57280]">5.0 ★</span>
          </a>
        </div>
      </div>

      {/* 
        ========================================================================
        2. MAIN STICKY NAVBAR (LIQUID GLASS FLOATING HEADER)
        ========================================================================
      */}
      <header
        className={`glass-liquid border-b transition-all duration-300 ${
          isScrolled ? 'py-1.5 sm:py-2.5 shadow-md' : 'py-2 sm:py-3.5 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Logo MEO with High-Resolution Logo Graphic */}
          <button
            onClick={handleLogoClick}
            className="flex items-center group select-none cursor-pointer text-left bg-transparent border-0 p-0.5 sm:p-1 rounded-2xl active:scale-98 transition-all hover:bg-white/10 dark:hover:bg-white/5 shrink-0"
            aria-label="На главную"
            title="MEO Studio (5 кликов для панели управления)"
          >
            <MeoLogo size="md" isDark={isDark} showSubtitle={true} showAddress={true} src={headerMeoLogoImg} variant="header" />
          </button>

          {/* Desktop Navigation Links with Liquid Glass Hover Pills */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.12em]">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className={`glass-nav-pill px-3 xl:px-3.5 py-1.5 rounded-full cursor-pointer font-bold transition-all ${
                  isDark
                    ? 'text-[#F0E6E9] hover:text-[#F29CAE]'
                    : 'text-[#26151B] hover:text-[#B6465B]'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Action Tools: Liquid Glass Theme Switcher, Saved Bookings & Primary CTA */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Liquid Glass Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`glass-liquid-pill flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer active:scale-95 shrink-0 ${
                isDark
                  ? 'text-[#F7CBD4] hover:border-[#C57280]/60'
                  : 'text-[#190F13] hover:border-[#B6465B]/50'
              }`}
              title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              aria-label="Переключить тему оформления"
            >
              {isDark ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-[#C57280]/20 flex items-center justify-center text-[#F7CBD4]">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden xl:inline text-[11px] font-bold uppercase tracking-wider ml-1.5">светлая</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-[#7A2434]/10 flex items-center justify-center text-[#7A2434]">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden xl:inline text-[11px] font-bold uppercase tracking-wider ml-1.5">тёмная</span>
                </>
              )}
            </button>

            {/* Saved Bookings Capsule */}
            {bookingsCount > 0 && (
              <button
                onClick={onOpenMyBookings}
                className="glass-liquid-pill hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 min-h-[40px]"
                title="Мои сохраненные записи"
              >
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[#C57280]" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C57280] animate-ping" />
                </div>
                <span className="text-[11px] font-bold">записи</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white text-[10px] font-black">
                  {bookingsCount}
                </span>
              </button>
            )}

            {/* Admin Panel Badge if logged in */}
            {isAdminLoggedIn && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#7A2434] to-[#C57280] text-white shadow-sm hover:brightness-110 cursor-pointer border border-white/20 active:scale-95 min-h-[40px]"
                title="Открыть панель администратора MEO"
              >
                <Shield className="w-3.5 h-3.5 text-[#F7CBD4]" />
                <span className="text-[11px] font-bold">Админ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Main Primary CTA Button with Specular Gloss & Shadow */}
            <button
              onClick={() => onOpenBooking()}
              className="relative group overflow-hidden flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer bg-gradient-to-r from-[#B83E58] via-[#C57280] to-[#CF6D7E] text-white shadow-md shadow-[#C57280]/25 hover:shadow-lg hover:shadow-[#C57280]/40 hover:brightness-105 min-h-[36px] sm:min-h-[42px] shrink-0"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
              <Sparkles className="w-3 h-3 hidden sm:inline transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-extrabold tracking-wider text-[11px] sm:text-xs">Записаться</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden xs:inline transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>

            {/* Mobile Menu Trigger (Liquid Glass Capsule) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass-liquid-pill w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню навигации'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#C57280]" />
              ) : (
                <Menu className={`w-5 h-5 ${isDark ? 'text-white' : 'text-[#190F13]'}`} />
              )}
            </button>
          </div>
        </div>

        {/* 
          ========================================================================
          3. MOBILE MENU DRAWER (LUXURIOUS FROSTED LIQUID GLASS SHEET)
          ========================================================================
        */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={`lg:hidden border-t mt-2 px-4 sm:px-6 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto glass-liquid shadow-2xl ${
                isDark ? 'text-white' : 'text-[#190F13]'
              }`}
            >
              {/* Grab handle indicator */}
              <div className="flex justify-center pt-1 pb-2">
                <div className={`w-12 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/15'}`} />
              </div>

              {/* Studio Info Card inside Drawer */}
              <div className="glass-liquid-card p-3.5 rounded-2xl border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C57280]" />
                    <span className="text-xs font-bold">Воронеж, ул. 9 Января, 233/40</span>
                  </div>
                  <a
                    href={SALON_INFO.yandexMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C57280]/20 text-[#C57280] flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 fill-[#E5A93C] text-[#E5A93C]" />
                    <span>5.0</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Clock className="w-3.5 h-3.5 text-[#C57280]" />
                    <span>10:00 — 22:00</span>
                  </div>
                  <a
                    href={`tel:${SALON_INFO.phoneMobileClean}`}
                    className="font-bold text-[#C57280] flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{SALON_INFO.phoneMobile}</span>
                  </a>
                </div>
              </div>

              {/* Theme Toggle Row */}
              <div className={`flex items-center justify-between py-2 border-b text-xs ${
                isDark ? 'border-white/10' : 'border-black/5'
              }`}>
                <span className={isDark ? 'text-[#D8C2C6]' : 'text-[#3E2930] font-semibold'}>
                  Тема оформления:
                </span>
                <button
                  onClick={toggleTheme}
                  className="glass-liquid-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[36px] active:scale-95"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#F7CBD4]" />
                      <span>Светлая</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#7A2434]" />
                      <span>Тёмная</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className={`text-left py-3 px-3.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[46px] flex items-center justify-between group active:scale-98 ${
                      isDark
                        ? 'text-[#F7F1F2] hover:bg-white/5 active:bg-white/10 hover:text-[#E8A5B2]'
                        : 'text-[#190F13] hover:bg-black/5 active:bg-black/10 hover:text-[#B6465B]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#C57280]" />
                  </button>
                ))}
              </div>

              {/* Direct Categories Navigation */}
              <div className="glass-liquid-card p-3.5 rounded-2xl border">
                <div className={`text-[10px] uppercase font-bold tracking-wider mb-2.5 ${isDark ? 'text-[#C57280]' : 'text-[#8C2B3F]'}`}>
                  Направления процедур MEO:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickServiceLinks.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => handleNavClick('#services', service.category)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer min-h-[46px] flex items-center active:scale-95 ${
                        isDark
                          ? 'bg-[#25181C]/80 border-white/10 text-neutral-200 hover:text-white hover:border-[#C57280]'
                          : 'bg-white/90 border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] hover:border-[#B6465B]'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons inside Drawer */}
              <div className={`pt-2 border-t flex flex-col gap-2.5 ${
                isDark ? 'border-white/10' : 'border-black/5'
              }`}>
                {isAdminLoggedIn && onOpenAdminPanel && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminPanel();
                    }}
                    className="flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl border bg-gradient-to-r from-[#7A2434] to-[#C57280] text-white border-[#C57280] shadow-sm cursor-pointer min-h-[46px] active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#E8A5B2]" />
                      <span>Панель администратора</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">Управление</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenMyBookings();
                  }}
                  className={`flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer min-h-[46px] active:scale-98 ${
                    isDark
                      ? 'bg-[#25181C] border-[#382329] text-white'
                      : 'bg-[#FCEEF1] border-[#DEC8CF] text-[#190F13]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C57280]" />
                    <span>Мои сохраненные записи</span>
                  </div>
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-[#C57280] text-white text-[11px]">
                    {bookingsCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white shadow-lg shadow-[#C57280]/25 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Записаться онлайн</span>
                </button>

                <a
                  href={`tel:${SALON_INFO.phoneMobileClean}`}
                  className="text-center py-3 text-xs font-bold tracking-wider uppercase rounded-xl border transition-all min-h-[46px] flex items-center justify-center gap-2 active:scale-98 glass-liquid-pill"
                >
                  <Phone className="w-4 h-4 text-[#C57280]" />
                  <span>{SALON_INFO.phoneMobile}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};

