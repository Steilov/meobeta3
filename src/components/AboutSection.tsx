import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Star,
  Layers,
  HeartHandshake,
  CreditCard,
  MapPin,
  Smile,
  Activity
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';
import { SafeImage } from './SafeImage';
import { MeoLogo } from './MeoLogo';
import { scrollToSection } from '../utils/navigation';
import aboutProcessImg from '../assets/images/regenerated_image_1789589691357.png';
import aboutInteriorImg from '../assets/images/regenerated_image_1789589692168.png';
import aboutMasteryImg from '../assets/images/regenerated_image_1789589695971.png';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  const { isDark } = useTheme();

  return (
    <section
      id="about"
      className={`py-16 lg:py-24 border-b transition-colors scroll-mt-16 ${
        isDark ? 'bg-[#150F11] border-[#382329] text-[#F7F1F2]' : 'bg-[#FBF9FA] border-[#DEC8CF] text-[#1A1014]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Story Intro */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16 pb-12 border-b border-neutral-500/20"
        >
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-[#C57280]" />
              <span className={isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}>о студии & философия</span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-[#190F13]'
            }`}>
              Красота начинается{' '}
              <span className="text-[#C57280]">
                со здоровья
              </span>
            </h2>
            <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              isDark ? 'bg-[#1F1418] border-[#3D252E] text-[#F3E2E6]' : 'bg-[#FDF2F4] border-[#EAC8D1] text-[#2E1D22]'
            }`}>
              <div className="font-bold mb-1 flex items-center gap-1.5 text-[#C57280]">
                <Sparkles className="w-4 h-4" />
                <span>«МЕО» — Мастер Естественного Омоложения</span>
              </div>
              <p>
                Цель создания нашей студии — восстановление обменных процессов и работы мышц в нормальном тонусе. Наша задача как мастеров — не замаскировать проблемы, а разобраться с первопричиной и вернуть организму естественную функциональность.
              </p>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-[#2E1D22]'}`}>
              Студия «MEO» на <strong className={isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}>ул. 9 Января, 233/40</strong> рассматривает организм целостно: мы подключаем приемы на осанку, фигуру, лицо, авторские массажные техники и передовое аппаратное оснащение.
            </p>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1 ${isDark ? 'text-neutral-300' : 'text-[#190F13] font-medium'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Аппаратная коррекция фигуры</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Эстетическая косметология лица</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Тренинг осанки и массаж спины</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Российская Лига косметологов</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={onOpenBooking}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[46px] active:scale-98 bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 shadow-md shadow-[#C57280]/25"
              >
                <span>Выбрать программу визита</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={SALON_INFO.vkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer min-h-[46px] active:scale-98 ${
                  isDark
                    ? 'border-[#0077FF]/40 text-[#67ABFF] hover:bg-[#0077FF]/15'
                    : 'border-[#0077FF]/30 text-[#0066DD] hover:bg-[#0077FF]/10'
                }`}
              >
                <span>Сообщество VK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Visual Pair with Founder Highlight */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#C57280]/20 shadow-md">
                <SafeImage
                  src={SALON_INFO.vkPhotoUrl}
                  fallbackSrc={aboutProcessImg}
                  alt="Наталья Вишневская — основатель студии МЕО"
                  className="object-cover aspect-[4/5] w-full"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <div className="font-serif text-xs sm:text-sm font-bold leading-tight">Наталья Вишневская</div>
                  <div className="text-[10px] text-[#F9CAD3] leading-tight mt-0.5">Основатель «МЕО» • Косметолог</div>
                </div>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-white border-[#DEC8CF] shadow-xs'
              }`}>
                <div className={`font-serif text-sm sm:text-base font-bold ${isDark ? 'text-[#E8A5B2]' : 'text-[#A84758]'}`}>
                  Лига косметологов РФ
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                  Дипломированный специалист
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-white border-[#DEC8CF] shadow-xs'
              }`}>
                <MeoLogo size="xs" isDark={isDark} showSubtitle={false} />
                <div>
                  <div className={`font-serif text-sm font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>Студия «МЕО»</div>
                  <div className={`text-[11px] mt-0.5 font-medium ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Воронеж, ул. 9 Января, 233/40
                  </div>
                </div>
              </div>

              <SafeImage
                src={aboutInteriorImg}
                fallbackSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600"
                alt="Интерьер MEO"
                className="rounded-2xl object-cover aspect-[4/5] w-full border border-[#C57280]/20 shadow-xs"
              />
            </div>
          </div>
        </motion.div>

        {/* 6 Core Comfort Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-16"
        >
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
              Стандарты заботы MEO
            </h3>
            <p className={`text-xs sm:text-sm mt-1.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
              Прозрачность, безопасность и максимальный комфорт в каждой процедуре.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SALON_INFO.amenities.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.5,
                  delay: (idx % 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
                className="glass-liquid-card p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-3 ${
                  isDark
                    ? 'bg-[#25181C] text-[#C57280] border-transparent'
                    : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]'
                }`}>
                  {idx === 0 && <Activity className="w-4 h-4" />}
                  {idx === 1 && <Sparkles className="w-4 h-4" />}
                  {idx === 2 && <ShieldCheck className="w-4 h-4" />}
                  {idx === 3 && <MapPin className="w-4 h-4" />}
                  {idx === 4 && <CreditCard className="w-4 h-4" />}
                  {idx === 5 && <Smile className="w-4 h-4" />}
                </div>
                <h4 className={`font-serif text-sm font-bold ${isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'}`}>
                  {item.title}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 3 Core Pillars in Action (Тело / Лицо / Осанка) */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          id="pillars"
          className={`glass-liquid-card rounded-3xl p-6 sm:p-8 lg:p-10 border transition-all ${
            isDark
              ? 'shadow-[0_12px_32px_rgba(0,0,0,0.5)]'
              : 'shadow-sm'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isDark
                  ? 'bg-[#25181C] text-[#C57280] border-[#382329]'
                  : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Три ключевых направления студии MEO</span>
              </div>

              <h3 className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                Гармония тела • Сияние лица • Здоровая осанка
              </h3>

              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-[#2E1D22]'}`}>
                Мы объединяем передовые аппаратные технологии коррекции силуэта с глубокими эстетическими уходами и восстанавливающим массажем спины. Каждая программа составляется персонально после предварительной диагностики.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-[#25181C] border-[#382329]' : 'bg-[#F8F2F4] border-[#DEC8CF]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-[#C57280] fill-[#C57280]" />
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#190F13]'}`}>Видимый эффект с 1 сеанса</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Устранение отечности, легкость в ногах и подтянутый тонус кожи.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-[#25181C] border-[#382329]' : 'bg-[#F8F2F4] border-[#DEC8CF]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#C57280]" />
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#190F13]'}`}>Выгодные абонементы</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Экономия до 25% при прохождении курсовых программ.
                  </p>
                </motion.div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenBooking}
                  className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer bg-[#C57280] text-white hover:bg-[#A84758]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Записаться на консультацию</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('services')}
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDark
                      ? 'border-[#382329] bg-[#25181C] text-neutral-200 hover:text-white hover:border-[#C57280]'
                      : 'border-[#DEC8CF] bg-[#F8F2F4] text-[#190F13] hover:text-[#B6465B] hover:border-[#B6465B]'
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#C57280]" />
                  <span>Каталог процедур и цен</span>
                </motion.button>
              </div>

              <div className={`flex items-center gap-2 text-xs pt-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                <Clock className="w-3.5 h-3.5 text-[#C57280]" />
                <span>Воронеж, ул. 9 Января, 233/40 • Ежедневно 09:00 — 21:00</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm">
                <SafeImage
                  src={aboutMasteryImg}
                  fallbackSrc="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=700"
                  alt="Атмосфера студии MEO"
                  className="rounded-2xl object-cover aspect-[4/3] w-full border border-[#C57280]/20 shadow-xl"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute -bottom-4 -left-4 p-3.5 rounded-2xl border shadow-xl flex items-center gap-3 ${
                    isDark ? 'bg-[#25181C] border-[#382329]' : 'bg-white border-[#DEC8CF]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#C57280]/20 text-[#C57280] flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#190F13]'}`}>Отличный рейтинг</div>
                    <div className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>на Яндекс Картах</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
