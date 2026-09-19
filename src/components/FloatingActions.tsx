import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Sparkles, Phone, Calendar, Layers, ExternalLink } from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';
import { scrollToSection } from '../utils/navigation';

interface FloatingActionsProps {
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  bookingsCount: number;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onOpenBooking,
  onOpenMyBookings,
  bookingsCount,
}) => {
  const { isDark } = useTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServicesClick = () => {
    scrollToSection('#services');
  };

  return (
    <>
      {/* Scroll-to-top button: neatly offset on mobile so it doesn't overlap bottom dock */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className={`fixed bottom-22 lg:bottom-6 right-3.5 lg:right-6 z-40 w-11 h-11 rounded-full border shadow-xl flex items-center justify-center transition-all cursor-pointer ${
              isDark
                ? 'bg-[#1D1417]/90 border-white/15 text-white hover:border-[#C57280]'
                : 'bg-white/90 border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B]'
            } backdrop-blur-md`}
            aria-label="Наверх"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Liquid Glass Bottom Navigation Dock */}
      <div className="lg:hidden fixed bottom-2 sm:bottom-3 inset-x-2.5 sm:inset-x-4 z-40 max-w-md mx-auto">
        <div className="glass-liquid rounded-2xl p-1.5 border flex items-center justify-between gap-1 shadow-2xl">
          {/* 1. Services Shortcut */}
          <button
            onClick={handleServicesClick}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[46px] active:scale-95 ${
              isDark
                ? 'text-[#D8C2C6] hover:bg-white/5 active:bg-white/10'
                : 'text-[#4A373D] hover:bg-black/5 active:bg-black/10'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C57280] mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight leading-none">Услуги</span>
          </button>

          {/* 2. Direct Call */}
          <a
            href={`tel:${SALON_INFO.phoneMobileClean}`}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[46px] active:scale-95 ${
              isDark
                ? 'text-[#D8C2C6] hover:bg-white/5 active:bg-white/10'
                : 'text-[#4A373D] hover:bg-black/5 active:bg-black/10'
            }`}
            title="Позвонить в студию"
          >
            <Phone className="w-4 h-4 text-[#C57280] mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight leading-none">Звонок</span>
          </a>

          {/* 3. Primary Booking Pill (Hero CTA) */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onOpenBooking}
            className="flex-[1.4] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white shadow-lg shadow-[#C57280]/30 cursor-pointer min-h-[46px] font-bold text-xs uppercase tracking-wider relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span className="whitespace-nowrap">Запись</span>
          </motion.button>

          {/* 4. My Bookings (or Calendar) */}
          <button
            onClick={onOpenMyBookings}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[46px] relative active:scale-95 ${
              isDark
                ? 'text-[#D8C2C6] hover:bg-white/5 active:bg-white/10'
                : 'text-[#4A373D] hover:bg-black/5 active:bg-black/10'
            }`}
            title="Мои записи"
          >
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#C57280] mb-0.5" />
              {bookingsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#C57280] text-white text-[8px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {bookingsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight leading-none">Записи</span>
          </button>

          {/* 5. VK Community Link */}
          <a
            href={SALON_INFO.vkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[46px] active:scale-95 ${
              isDark
                ? 'text-[#59A5FF] hover:bg-white/5 active:bg-white/10'
                : 'text-[#0066DD] hover:bg-black/5 active:bg-black/10'
            }`}
            title="VK сообщество студии"
          >
            <span className="w-4 h-4 flex items-center justify-center font-extrabold text-[11px] leading-none mb-0.5">VK</span>
            <span className="text-[10px] font-bold tracking-tight leading-none">ВК</span>
          </a>
        </div>
      </div>

      {/* Desktop Floating Actions */}
      <div className="hidden lg:flex fixed bottom-6 right-8 z-40 items-center gap-2">
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={SALON_INFO.vkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0077FF] hover:bg-[#0066DD] text-white text-xs font-bold shadow-lg transition-colors"
        >
          <span className="font-extrabold text-xs">VK</span>
          <span>ВКонтакте</span>
        </motion.a>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenBooking}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C57280]/25 cursor-pointer bg-[#C57280] text-white hover:bg-[#A84758] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Онлайн-запись</span>
        </motion.button>
      </div>
    </>
  );
};

