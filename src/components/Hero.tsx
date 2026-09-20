import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';
import { SafeImage } from './SafeImage';
import { MeoLogo } from './MeoLogo';
import heroMeoLogoImg from '../assets/images/regenerated_image_1789849924701.png';
import { scrollToSection, goToServicesCategory } from '../utils/navigation';

interface HeroProps {
  onOpenBooking: (serviceId?: string) => void;
  onExplorePortfolio: () => void;
  onOpenAdminAuth?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExplorePortfolio, onOpenAdminAuth }) => {
  const { isDark } = useTheme();
  const [quickService, setQuickService] = useState('body-vacuum-massage');
  const heroLogoClicksRef = React.useRef(0);
  const heroTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleHeroLogoClick = () => {
    if (heroTimerRef.current) {
      clearTimeout(heroTimerRef.current);
    }
    heroLogoClicksRef.current += 1;
    if (heroLogoClicksRef.current >= 5) {
      heroLogoClicksRef.current = 0;
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      }
      return;
    }
    heroTimerRef.current = setTimeout(() => {
      heroLogoClicksRef.current = 0;
    }, 2500);
  };

  return (
    <section
      id="hero"
      className={`relative overflow-hidden pt-6 pb-16 lg:pt-10 lg:pb-24 transition-colors ${
        isDark ? 'bg-[#150f11] text-[#F7F1F2]' : 'bg-[#FBF9FA] text-[#1A1014]'
      }`}
    >
      {/* Background Organic Wave Accents inspired by the photo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft fluid glowing aura - static on mobile, subtle on desktop to save battery & GPU */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] lg:w-[900px] h-[400px] lg:h-[550px] rounded-full blur-2xl lg:blur-3xl opacity-40 will-change-transform ${
            isDark ? 'bg-[#C57280]/20' : 'bg-[#F4D9DF]/70'
          }`}
        />

        {/* Ambient subtle fluid blush shapes */}
        <div
          className={`absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-2xl ${
            isDark ? 'bg-[#3A2228]/40' : 'bg-[#F9E2E6]/80'
          }`}
        />
        <div
          className={`absolute -bottom-28 -right-20 w-[450px] h-[450px] rounded-full blur-2xl ${
            isDark ? 'bg-[#3A2228]/35' : 'bg-[#F6DCE1]/70'
          }`}
        />

        {/* Decorative thin organic curved lines mirroring the banner */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 180 C 300 240, 500 80, 850 160 C 1100 220, 1300 120, 1500 190"
            stroke={isDark ? '#C57280' : '#E8B4BE'}
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <path
            d="M-100 480 C 250 400, 600 520, 950 440 C 1200 380, 1400 460, 1550 410"
            stroke={isDark ? '#C57280' : '#E8B4BE'}
            strokeWidth="1"
            opacity="0.45"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Floating Badge Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-8 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className={`glass-liquid-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-xs ${
              isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#C57280] animate-pulse" />
              <span className="font-semibold text-[11px] sm:text-xs">
                Воронеж, ул. 9 Января, 233/40
              </span>
            </div>

            {/* Official VK Community Badge */}
            <a
              href={SALON_INFO.vkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass-liquid-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold text-[11px] sm:text-xs transition-transform active:scale-95 shadow-xs ${
                isDark
                  ? 'text-[#59A5FF] hover:bg-[#0077FF]/20'
                  : 'text-[#0066DD] hover:bg-[#0077FF]/15'
              }`}
              title="Официальное сообщество студии ВКонтакте"
            >
              <span className="font-bold">VK</span>
              <span>Сообщество @natalya_meo</span>
            </a>
          </div>

          <a
            href={SALON_INFO.yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`glass-liquid-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-transform active:scale-95 shadow-xs font-semibold text-[11px] sm:text-xs ${
              isDark
                ? 'text-[#E8A5B2] hover:bg-white/5'
                : 'text-[#7A1E30] hover:bg-black/5'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-[#C57280] text-[#C57280]" />
            <span>Отличный рейтинг на Яндекс Картах</span>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* HERO PANORAMA CARD: DIRECT VISUAL TWIN OF THE USER'S PHOTO */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`relative rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 glass-liquid-card ${
            isDark
              ? 'border-[#C57280]/30 shadow-[#C57280]/10'
              : 'border-[#DEC8CF] shadow-lg shadow-neutral-900/5'
          }`}
        >
          {/* Subtle curved background ribbon overlay inside the card */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <svg
              className="absolute w-full h-full opacity-35"
              viewBox="0 0 1200 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Soft pink fluid organic blob */}
              <path
                d="M500 40C620 -10 740 60 820 140C900 220 940 320 880 400C820 480 660 500 520 440C380 380 380 260 410 160C440 60 380 90 500 40Z"
                fill={isDark ? '#3D242B' : '#F6DBE0'}
                opacity="0.4"
              />
              <path
                d="M100 200 C 400 350, 700 80, 1100 250"
                stroke={isDark ? '#C57280' : '#E8B4BE'}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-12">
            
            {/* Top Row: Left Cursive Badge + Center MEO Logo + Right Micro Info */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b ${
              isDark ? 'border-[#C57280]/20' : 'border-[#DEC8CF]'
            }`}>
              
              {/* 1. Left Handwritten Cursive Badge: «Забота о вашей красоте ♡» */}
              <div className="md:col-span-3 flex justify-start">
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-transform hover:scale-105 select-none ${
                    isDark
                      ? 'bg-[#291A1E]/80 border-[#C57280]/40 text-[#F5CBD2]'
                      : 'bg-[#FCEEF1] border-[#DEC8CF] text-[#7A1E30] shadow-xs'
                  }`}
                >
                  <span className="font-script text-xl sm:text-2xl font-semibold tracking-wide">
                    Забота о вашей красоте
                  </span>
                  <Heart className="w-3.5 h-3.5 fill-current text-[#C57280] animate-pulse" />
                </motion.div>
              </div>

              {/* 2. Center Brand Logo Block with Silhouette & Organic Shapes (Exact replica from photo) */}
              <div className="md:col-span-6 flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="flex flex-col items-center py-2"
                >
                  <button
                    type="button"
                    onClick={handleHeroLogoClick}
                    className="cursor-pointer bg-transparent border-0 p-0 focus:outline-none transition-transform duration-300 hover:scale-[1.03]"
                    aria-label="Логотип MEO — Студия коррекции фигуры и эстетической косметологии"
                    title="MEO Studio"
                  >
                    <MeoLogo size="hero" isDark={isDark} showSubtitle={true} src={heroMeoLogoImg} variant="hero" />
                  </button>
                </motion.div>
              </div>

              {/* 3. Right Value Pillars (ГАРМОНИЯ ТЕЛА / УВЕРЕННОСТЬ / ЗДОРОВЬЕ) */}
              <div className="md:col-span-3 flex justify-end">
                <div className="text-right space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
                  <div className={`font-bold ${isDark ? 'text-[#E8A5B2]' : 'text-[#7A1E30]'}`}>
                    Гармония тела
                  </div>
                  <div className={`w-12 h-px ml-auto ${isDark ? 'bg-[#C57280]/40' : 'bg-[#DEC8CF]'}`} />
                  <div className={isDark ? 'text-neutral-300' : 'text-[#190F13]'}>
                    Уверенность в себе
                  </div>
                  <div className={`w-12 h-px ml-auto ${isDark ? 'bg-[#C57280]/40' : 'bg-[#DEC8CF]'}`} />
                  <div className={`font-semibold ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Здоровье каждый день
                  </div>
                </div>
              </div>

            </div>

            {/* Center Main Stage: Headline & Key Visual Trio */}
            <div className="py-8 sm:py-12 flex flex-col items-center text-center">
              
              {/* Grand Headline (From photo: КРАСОТА НАЧИНАЕТСЯ СО ЗДОРОВЬЯ) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-1.5 sm:space-y-2 mb-8 sm:mb-10 max-w-3xl"
              >
                <h1 className={`font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-[0.14em] uppercase leading-none drop-shadow-xs ${
                  isDark ? 'text-[#E28B99]' : 'text-[#7A1E30]'
                }`}>
                  КРАСОТА
                </h1>
                <p className={`text-sm sm:text-lg lg:text-xl font-extrabold tracking-[0.28em] sm:tracking-[0.32em] uppercase leading-relaxed ${
                  isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'
                }`}>
                  НАЧИНАЕТСЯ СО ЗДОРОВЬЯ
                </p>
              </motion.div>

              {/* The 3 Circular Badges: ТЕЛО • ЛИЦО • ОСАНКА (Interactive!) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-10 select-none flex-wrap"
              >
                {/* 1. ТЕЛО */}
                <button
                  type="button"
                  onClick={() => goToServicesCategory('body')}
                  className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isDark
                        ? 'border-[#C57280]/60 bg-[#25181C] group-hover:border-[#E8A5B2] group-hover:bg-[#341F25] shadow-lg shadow-[#C57280]/15'
                        : 'border-[#DEC8CF] bg-white group-hover:border-[#7A1E30] group-hover:bg-[#FCEEF1] shadow-sm'
                    }`}
                  >
                    {/* Line art for Body Contour */}
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13 ${
                        isDark ? 'text-[#F2B6C0]' : 'text-[#7A1E30]'
                      }`}
                    >
                      {/* Waist, hips, bikini contour line-art */}
                      <path
                        d="M16 10C16 18 20 22 17 32C15 38 13 42 13 42"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M32 10C32 18 28 22 31 32C33 38 35 42 35 42"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 26C21 28 27 28 31 26"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M18 31C22 39 26 39 30 31"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <circle cx="24" cy="20" r="1.2" fill="currentColor" />
                    </svg>
                  </div>
                  <span className={`font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-colors ${
                    isDark
                      ? 'text-[#F7F1F2] group-hover:text-[#E8A5B2]'
                      : 'text-[#190F13] group-hover:text-[#7A1E30]'
                  }`}>
                    ТЕЛО
                  </span>
                </button>

                {/* Separator Dot */}
                <span className={`w-1.5 h-1.5 rounded-full self-center hidden sm:block ${
                  isDark ? 'bg-[#C57280]/60' : 'bg-[#DEC8CF]'
                }`} />

                {/* 2. ЛИЦО */}
                <button
                  type="button"
                  onClick={() => goToServicesCategory('face')}
                  className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isDark
                        ? 'border-[#C57280]/60 bg-[#25181C] group-hover:border-[#E8A5B2] group-hover:bg-[#341F25] shadow-lg shadow-[#C57280]/15'
                        : 'border-[#DEC8CF] bg-white group-hover:border-[#7A1E30] group-hover:bg-[#FCEEF1] shadow-sm'
                    }`}
                  >
                    {/* Line art for Face Profile */}
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13 ${
                        isDark ? 'text-[#F2B6C0]' : 'text-[#7A1E30]'
                      }`}
                    >
                      {/* Female head profile with lifting care points */}
                      <path
                        d="M26 12C20 12 16 16 16 22C16 26 17 28 19 30C20 31 20 33 20 35C20 37 22 39 26 39"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M26 12C33 12 36 17 36 24C36 28 34 32 30 35C28 37 27 38 26 39"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M20 23C22 23 23 25 24 25"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      {/* Delicate beauty points */}
                      <circle cx="28" cy="22" r="1.2" fill="currentColor" />
                      <circle cx="30" cy="27" r="1.2" fill="currentColor" />
                      <circle cx="26" cy="32" r="1.2" fill="currentColor" />
                    </svg>
                  </div>
                  <span className={`font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-colors ${
                    isDark
                      ? 'text-[#F7F1F2] group-hover:text-[#E8A5B2]'
                      : 'text-[#190F13] group-hover:text-[#7A1E30]'
                  }`}>
                    ЛИЦО
                  </span>
                </button>

                {/* Separator Dot */}
                <span className={`w-1.5 h-1.5 rounded-full self-center hidden sm:block ${
                  isDark ? 'bg-[#C57280]/60' : 'bg-[#DEC8CF]'
                }`} />

                {/* 3. ОСАНКА */}
                <button
                  type="button"
                  onClick={() => goToServicesCategory('posture')}
                  className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isDark
                        ? 'border-[#C57280]/60 bg-[#25181C] group-hover:border-[#E8A5B2] group-hover:bg-[#341F25] shadow-lg shadow-[#C57280]/15'
                        : 'border-[#DEC8CF] bg-white group-hover:border-[#7A1E30] group-hover:bg-[#FCEEF1] shadow-sm'
                    }`}
                  >
                    {/* Line art for Spine and Posture */}
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13 ${
                        isDark ? 'text-[#F2B6C0]' : 'text-[#7A1E30]'
                      }`}
                    >
                      {/* Posture curve / spine alignment */}
                      <path
                        d="M18 12C20 18 20 30 18 38"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M30 12C28 18 28 30 30 38"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      {/* Vertebrae spine nodes */}
                      <path
                        d="M24 10V38"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <circle cx="24" cy="14" r="1.5" fill="currentColor" />
                      <circle cx="24" cy="20" r="1.5" fill="currentColor" />
                      <circle cx="24" cy="26" r="1.5" fill="currentColor" />
                      <circle cx="24" cy="32" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span className={`font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-colors ${
                    isDark
                      ? 'text-[#F7F1F2] group-hover:text-[#E8A5B2]'
                      : 'text-[#190F13] group-hover:text-[#7A1E30]'
                  }`}>
                    ОСАНКА
                  </span>
                </button>
              </motion.div>

            </div>

            {/* Bottom Action Bar: Direct Booking CTA & Quick Selector */}
            <div className={`pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 ${
              isDark ? 'border-[#C57280]/20' : 'border-[#DEC8CF]'
            }`}>
              
              {/* Quick Select Tool */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <span className={`text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-[#D8C2C6]' : 'text-[#190F13]'
                }`}>
                  Быстрая запись:
                </span>
                <select
                  value={quickService}
                  onChange={(e) => setQuickService(e.target.value)}
                  className={`w-full sm:w-auto px-3.5 py-2.5 text-xs font-semibold rounded-xl border outline-none cursor-pointer transition-colors max-w-full sm:max-w-[280px] min-h-[44px] ${
                    isDark
                      ? 'bg-[#181013] border-[#C57280]/40 text-white focus:border-[#E8A5B2]'
                      : 'bg-white border-[#DEC8CF] text-[#190F13] focus:border-[#7A1E30]'
                  }`}
                >
                  <option value="body-vacuum-massage">Вакуумно-роликовый массаж (от 1600 ₽)</option>
                  <option value="body-cavitation">УЗ-кавитация проблемных зон (от 1500 ₽)</option>
                  <option value="face-deep-cleaning">Комбинированная чистка лица (от 2400 ₽)</option>
                  <option value="face-allseason-peeling">Всесезонный пилинг-сияние (от 2200 ₽)</option>
                  <option value="posture-healthy-back">Массаж «Здоровая осанка» (от 1700 ₽)</option>
                  <option value="posture-neck-shoulders">Массаж ШВЗ (от 1200 ₽)</option>
                  <option value="pkg-harmony-body">Комплекс «Гармония тела» (3600 ₽)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onOpenBooking(quickService)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white shadow-lg shadow-[#C57280]/25 min-h-[48px] active:scale-96"
                >
                  <span>Записаться на приём</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => scrollToSection('services')}
                  className={`px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-colors cursor-pointer text-center min-h-[44px] hidden sm:inline-flex items-center justify-center ${
                    isDark
                      ? 'border-[#C57280]/40 text-[#F5CBD2] hover:bg-[#2A1B1F]'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#7A1E30] hover:bg-[#FCEEF1]'
                  }`}
                >
                  Все услуги и прайс
                </motion.button>
              </div>

            </div>

          </div>
        </motion.div>

        {/* Feature Strip under banner: 3 Main Pillars Highlights with Staggered Scroll Motion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mt-6">
          {SALON_INFO.pillars.map((pillar, index) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goToServicesCategory(pillar.id as any)}
              className="glass-liquid-card p-4 sm:p-5 rounded-2xl cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-serif text-lg font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#E8A5B2]' : 'text-[#7A1E30]'
                }`}>
                  {pillar.title}
                </span>
                <ChevronRight className="w-4 h-4 text-[#C57280] transition-transform group-hover:translate-x-1" />
              </div>
              <p className={`text-xs font-bold mb-1.5 ${
                isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'
              }`}>
                {pillar.subtitle}
              </p>
              <p className={`text-xs leading-relaxed ${
                isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'
              }`}>
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
