import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, X, ZoomIn, Check } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/salonData';
import { PortfolioItem, ServiceCategory } from '../types';
import { useTheme } from '../context/ThemeContext';
import { SafeImage } from './SafeImage';
import acneFullCollage from '../assets/images/regenerated_image_1789584495306.jpg';
import acneBeforeImage from '../assets/images/acne_before.jpg';
import acneAfterImage from '../assets/images/acne_after.jpg';

interface PortfolioSectionProps {
  onSelectServiceForBooking: (serviceId?: string) => void;
}

interface ComparisonItem {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  master: string;
  duration: string;
  serviceId: string;
  buttonText: string;
  fullSplitImg: string;
  beforeImg: string;
  afterImg: string;
  fallbackBefore: string;
  fallbackAfter: string;
}

const COMPARISONS: ComparisonItem[] = [
  {
    id: 'acne-face',
    tabLabel: 'Пилинг',
    title: 'Пилинг & выравнивание тона кожи',
    description: 'Клинический протокол студии «MEO»: деликатная подготовка, всесезонный пилинг и восстанавливающий био-уход. Полное снятие покраснений, купирование очагов воспалений, сужение пор и ровный фарфоровый тон.',
    master: 'Врач-косметолог студии «MEO»',
    duration: '1 час 30 мин',
    serviceId: 'face-ultrasonic-cleansing',
    buttonText: 'Записаться на пилинг',
    fullSplitImg: acneFullCollage,
    beforeImg: acneBeforeImage,
    afterImg: acneAfterImage,
    fallbackBefore: 'https://images.unsplash.com/photo-1512290900672-1f5be63dc6fa?auto=format&fit=crop&q=80&w=1200',
    fallbackAfter: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200',
  },
];

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ onSelectServiceForBooking }) => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [modalShowBefore, setModalShowBefore] = useState<boolean>(false);

  // Before / After Slider state: initially shows acne face (100% before), user drags to reveal clean face
  const [activeComparisonId, setActiveComparisonId] = useState<string>('acne-face');
  const [sliderPosition, setSliderPosition] = useState<number>(100);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'split'>('slider');
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState<boolean>(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  const animIntervalRef = useRef<number | null>(null);

  // Clean up auto-animation on unmount
  React.useEffect(() => {
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, []);

  const toggleAutoAnimation = () => {
    if (isAutoAnimating) {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      setIsAutoAnimating(false);
      return;
    }
    setIsAutoAnimating(true);
    let pos = sliderPosition;
    let direction = pos <= 10 ? 1 : -1;
    animIntervalRef.current = window.setInterval(() => {
      pos += direction * 2;
      if (pos <= 0) {
        pos = 0;
        direction = 1;
      } else if (pos >= 100) {
        pos = 100;
        direction = -1;
      }
      setSliderPosition(pos);
    }, 30);
  };

  const filterTabs: { id: ServiceCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'все работы' },
    { id: 'body', label: 'тело & коррекция' },
    { id: 'face', label: 'лицо & косметология' },
    { id: 'posture', label: 'осанка & спина' },
    { id: 'packages', label: 'комплексы' },
  ];

  const filteredItems = PORTFOLIO_DATA.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  const currentComparison =
    COMPARISONS.find((c) => c.id === activeComparisonId) || COMPARISONS[0];

  // Smooth scroll to gallery items when tapping category tab (vital on smartphones)
  const handleCategorySelect = (categoryId: ServiceCategory | 'all') => {
    setSelectedCategory(categoryId);
    setTimeout(() => {
      if (galleryGridRef.current) {
        const headerOffset = 90;
        const elementPosition = galleryGridRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  // Slider pointer interactions (smooth, touch-safe, zero squishing)
  const updateSliderFromClientX = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      setIsAutoAnimating(false);
    }
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      updateSliderFromClientX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <section
      id="portfolio"
      className={`py-16 lg:py-24 border-b transition-colors scroll-mt-16 ${
        isDark ? 'bg-[#150F11] border-[#382329] text-[#F7F1F2]' : 'bg-[#FBF9FA] border-[#DEC8CF] text-[#1A1014]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b ${
            isDark ? 'border-neutral-500/20' : 'border-[#DEC8CF]'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C57280]" />
              <span className={isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}>портфолио & результаты</span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-[#190F13]'
            }`}>
              Результаты{' '}
              <span className="text-[#C57280]">
                MEO
              </span>
            </h2>
          </div>

          {/* Active Service Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#C57280] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Процедура: Пилинг</span>
            </span>
          </div>
        </motion.div>

        {/* Interactive Before/After Transformation Slider */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="glass-liquid-card mb-12 sm:mb-14 rounded-2xl p-4 sm:p-7 border transition-colors shadow-xl"
        >
          {/* Comparison Selector & View Modes */}
          <div className="flex items-center justify-between flex-wrap gap-2.5 pb-4 mb-5 sm:mb-6 border-b border-neutral-500/20">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                isDark
                  ? 'bg-[#25181C] text-[#C57280] border-transparent'
                  : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Клиническое «До / После»</span>
              </span>
              <span className={`text-xs hidden sm:inline ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                • Фото реального клиента студии «MEO»
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer min-h-[38px] active:scale-95 ${
                  viewMode === 'split'
                    ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white border-transparent shadow-xs'
                    : isDark
                      ? 'border-white/10 text-neutral-300 hover:text-white bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4]'
                }`}
              >
                Сплит
              </button>
              <button
                onClick={() => setViewMode('slider')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer min-h-[38px] active:scale-95 ${
                  viewMode === 'slider'
                    ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white border-transparent shadow-xs'
                    : isDark
                      ? 'border-white/10 text-neutral-300 hover:text-white bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4]'
                }`}
              >
                Слайдер
              </button>
              <button
                onClick={() => setIsEnlarged(true)}
                className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95 ${
                  isDark ? 'border-white/10 text-neutral-300 hover:text-white bg-white/5' : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4]'
                }`}
                title="Увеличить фото"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Info Side */}
            <div className="lg:col-span-5 space-y-3 text-left">
              <h3 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                {currentComparison.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                {currentComparison.description}
              </p>
              <div className={`space-y-1 text-xs pt-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                <div>Специалист: <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>{currentComparison.master}</strong></div>
                <div>Длительность: <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>{currentComparison.duration}</strong></div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onSelectServiceForBooking(currentComparison.serviceId)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[46px] active:scale-98 bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 shadow-md shadow-[#C57280]/25"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentComparison.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEnlarged(true)}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer min-h-[46px] active:scale-98 ${
                    isDark
                      ? 'border-white/10 text-neutral-300 hover:text-white hover:border-[#C57280] bg-white/5'
                      : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] hover:border-[#B6465B] bg-[#F8F2F4]'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Увеличить</span>
                </button>
              </div>
            </div>

            {/* Display Component: Split View or Slider */}
            <div className="lg:col-span-7">
              {viewMode === 'split' ? (
                <div>
                  <div
                    onClick={() => setIsEnlarged(true)}
                    className="relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] max-w-md mx-auto select-none border border-neutral-700/50 shadow-md bg-neutral-950 cursor-zoom-in group"
                  >
                    <SafeImage
                      src={currentComparison.fullSplitImg}
                      fallbackSrc={currentComparison.fallbackBefore}
                      alt="Результат терапии акне До и После студии MEO"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />

                    {/* Overlays for Before (Left) and After (Right) */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md pointer-events-none flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>ДО: Воспаления</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md pointer-events-none flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>ПОСЛЕ: Чистая кожа</span>
                    </div>

                    {/* Center divider line */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none">
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-xs">
                        MEO
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white/90 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-[#C57280]" />
                      <span>Нажмите для увеличения</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-2 text-center">
                    Клинический результат курса терапии • Студия «MEO»
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    ref={sliderRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] max-w-md mx-auto select-none border border-neutral-700/50 cursor-ew-resize group touch-none shadow-xl bg-neutral-900"
                    tabIndex={0}
                    role="slider"
                    aria-valuenow={sliderPosition}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Интерактивное сравнение до и после терапии акне"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') setSliderPosition((p) => Math.max(0, p - 5));
                      if (e.key === 'ArrowRight') setSliderPosition((p) => Math.min(100, p + 5));
                    }}
                  >
                    {/* AFTER image (bottom layer, unclipped clean face) */}
                    <SafeImage
                      src={currentComparison.afterImg}
                      fallbackSrc={currentComparison.fallbackAfter}
                      alt="После процедуры: чистая кожа без воспалений"
                      className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                    />
                    <span className="absolute top-3 right-3 z-10 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md pointer-events-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      после: чистая кожа
                    </span>

                    {/* BEFORE image (top layer, clipped smoothly: reveals clean skin as you drag left) */}
                    <div
                      className="absolute inset-0 overflow-hidden select-none pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <SafeImage
                        src={currentComparison.beforeImg}
                        fallbackSrc={currentComparison.fallbackBefore}
                        alt="До процедуры: лицо с воспалениями и акне"
                        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                      />
                      <span className="absolute top-3 left-3 z-10 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md pointer-events-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        до: воспаления
                      </span>
                    </div>

                    {/* Initial Drag Prompt (shown when slider is at or near 100% До) */}
                    {sliderPosition >= 80 && (
                      <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex justify-center animate-bounce">
                        <div className="bg-black/85 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
                          <span>← Потяните влево, чтобы увидеть чистое лицо</span>
                        </div>
                      </div>
                    )}

                    {/* Divider Line & Grab Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#C57280] pointer-events-none shadow-[0_0_12px_rgba(197,114,128,1)] z-20"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#C57280] text-white flex items-center justify-center font-bold text-xs shadow-2xl border-2 border-white pointer-events-none transition-transform group-hover:scale-110"
                      >
                        ⇄
                      </div>
                    </div>
                  </div>

                  {/* Slider Quick Buttons & Instructions */}
                  <div className="max-w-md mx-auto mt-3">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (animIntervalRef.current) clearInterval(animIntervalRef.current);
                            setIsAutoAnimating(false);
                            setSliderPosition(100);
                          }}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            sliderPosition >= 90
                              ? 'bg-[#C57280] text-white border-[#C57280]'
                              : isDark
                                ? 'border-[#382329] text-neutral-400 hover:text-white'
                                : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4]'
                          }`}
                        >
                          100% До
                        </button>
                        <button
                          onClick={() => {
                            if (animIntervalRef.current) clearInterval(animIntervalRef.current);
                            setIsAutoAnimating(false);
                            setSliderPosition(50);
                          }}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            sliderPosition >= 40 && sliderPosition <= 60
                              ? 'bg-[#C57280] text-white border-[#C57280]'
                              : isDark
                                ? 'border-[#382329] text-neutral-400 hover:text-white'
                                : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4]'
                          }`}
                        >
                          50 / 50
                        </button>
                        <button
                          onClick={() => {
                            if (animIntervalRef.current) clearInterval(animIntervalRef.current);
                            setIsAutoAnimating(false);
                            setSliderPosition(0);
                          }}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            sliderPosition <= 10
                              ? 'bg-[#C57280] text-white border-[#C57280]'
                              : isDark
                                ? 'border-[#382329] text-neutral-400 hover:text-white'
                                : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] bg-[#F8F2F4]'
                          }`}
                        >
                          100% После
                        </button>
                      </div>

                      <button
                        onClick={toggleAutoAnimation}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          isAutoAnimating
                            ? 'bg-[#C57280] text-white border-[#C57280] animate-pulse'
                            : isDark
                              ? 'border-[#382329] text-neutral-300 hover:text-white hover:border-[#C57280]'
                              : 'border-[#DEC8CF] text-[#190F13] hover:text-[#B6465B] hover:border-[#B6465B] bg-[#F8F2F4]'
                        }`}
                        title="Автоматическая демонстрация результата"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isAutoAnimating ? 'Остановить' : 'Преображение'}</span>
                      </button>
                    </div>

                    <p className={`text-[11px] mt-2 text-center ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                      Тяните ползунок влево, чтобы открыть результат с чистой кожей
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid Section Target */}
        <div ref={galleryGridRef} id="portfolio-grid" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
              Выбранная работа:{' '}
              <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>
                {filteredItems[0]?.title || 'Пилинг'}
              </strong>
            </div>
          </div>

          <div className="max-w-md sm:max-w-xl mx-auto">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: 0.35,
                  ease: 'easeOut',
                }}
                className="glass-liquid-card rounded-2xl overflow-hidden border transition-all duration-300 md:hover:-translate-y-1 flex flex-col group shadow-sm hover:shadow-xl"
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-neutral-900 cursor-pointer"
                  onClick={() => {
                    setActiveModalItem(item);
                    setModalShowBefore(false);
                  }}
                >
                  <SafeImage
                    src={item.image}
                    fallbackSrc={item.fallbackImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.beforeImage && (
                    <span className="absolute top-3 left-3 bg-[#C57280] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      Есть «До и После»
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-lg">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Увеличить</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                            isDark
                              ? 'bg-[#181820] text-neutral-300'
                              : 'bg-[#FCEEF1] text-[#7A2434] border border-[#DEC8CF]'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h4 className={`font-display text-base sm:text-lg font-bold ${
                      isDark ? 'text-white' : 'text-[#190F13]'
                    }`}>
                      {item.title}
                    </h4>

                    <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                      isDark ? 'text-neutral-300' : 'text-[#2E1D22]'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  <div className={`pt-4 mt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-neutral-500/20' : 'border-[#DEC8CF]'
                  }`}>
                    <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                      Студия: <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>«MEO»</strong>
                    </span>
                    <button
                      onClick={() => onSelectServiceForBooking(item.serviceId)}
                      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isDark ? 'text-[#E8A5B2] hover:text-white' : 'text-[#7A2434] hover:text-[#B6465B]'
                      }`}
                    >
                      <span>Записаться на процедуру</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal with optional Before/After view */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 sm:backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className={`rounded-t-3xl sm:rounded-2xl max-w-lg w-full overflow-hidden border relative animate-in fade-in duration-200 glass-liquid ${
              isDark ? 'border-white/10 text-white' : 'border-[#DEC8CF] text-[#190F13]'
            }`}>
              {/* Mobile Grab Handle */}
              <div className="w-10 h-1 rounded-full bg-neutral-400/40 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-xl bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                {modalShowBefore && activeModalItem.beforeImage ? (
                  <img
                    src={activeModalItem.beforeImage}
                    alt="До процедуры"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <SafeImage
                    src={activeModalItem.image}
                    fallbackSrc={activeModalItem.fallbackImage}
                    alt={activeModalItem.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Badge for modal view */}
                <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                  {modalShowBefore ? 'Исходное состояние: До' : 'Результат: После'}
                </span>

                {/* Toggle buttons if beforeImage exists */}
                {activeModalItem.beforeImage && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/10">
                    <button
                      onClick={() => setModalShowBefore(true)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[34px] ${
                        modalShowBefore ? 'bg-[#C57280] text-white' : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      Показать До
                    </button>
                    <button
                      onClick={() => setModalShowBefore(false)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[34px] ${
                        !modalShowBefore ? 'bg-[#C57280] text-white' : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      Показать После
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 text-left space-y-3">
                <h3 className="font-serif text-lg font-bold">
                  {activeModalItem.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                  {activeModalItem.description}
                </p>
                <div className="flex items-center justify-between text-xs py-2.5 border-y border-neutral-500/20">
                  <span>Студия: <strong>«MEO»</strong></span>
                  <span>Время: <strong>{activeModalItem.durationMinutes} мин</strong></span>
                </div>
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className={`px-4 py-2.5 text-xs font-semibold cursor-pointer rounded-xl min-h-[44px] flex items-center ${
                      isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-[#2E1D22] hover:text-black hover:bg-black/5'
                    }`}
                  >
                    Закрыть
                  </button>
                  <button
                    onClick={() => {
                      const id = activeModalItem.serviceId;
                      setActiveModalItem(null);
                      onSelectServiceForBooking(id);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer min-h-[44px] bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 active:scale-98 shadow-md shadow-[#C57280]/20 flex items-center justify-center"
                  >
                    Записаться на процедуру
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Enlarged Before/After Acne Therapy Photo */}
        {isEnlarged && (
          <div className="fixed inset-0 z-50 bg-black/85 sm:backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className={`rounded-t-3xl sm:rounded-2xl max-w-3xl w-full overflow-hidden border relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl glass-liquid max-h-[90vh] flex flex-col ${
              isDark ? 'border-white/10 text-white' : 'border-[#DEC8CF] text-[#190F13]'
            }`}>
              {/* Mobile Grab Handle */}
              <div className="w-10 h-1 rounded-full bg-neutral-400/40 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

              <button
                onClick={() => setIsEnlarged(false)}
                className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-xl bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors shadow-lg active:scale-95"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black overflow-hidden shrink-0">
                <SafeImage
                  src={currentComparison.fullSplitImg}
                  fallbackSrc={currentComparison.fallbackBefore}
                  alt="Клинический результат терапии акне До и После"
                  className="w-full h-full object-contain"
                />

                {/* Badges in modal */}
                <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>ДО: Воспаления</span>
                </span>
                <span className="absolute top-4 right-14 bg-black/80 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>ПОСЛЕ: Чистая кожа</span>
                </span>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none" />
              </div>

              <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-serif text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                      {currentComparison.title}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                      {currentComparison.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-2.5 border-y border-neutral-500/20">
                  <span>Студия: <strong>«MEO» (ул. 9 Января, 233/40)</strong></span>
                  <span>Специалист: <strong>{currentComparison.master}</strong></span>
                  <span>Длительность: <strong>{currentComparison.duration}</strong></span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    onClick={() => setIsEnlarged(false)}
                    className={`px-4 py-2.5 text-xs font-semibold cursor-pointer rounded-xl min-h-[44px] flex items-center ${
                      isDark ? 'text-neutral-400 hover:text-white' : 'text-[#2E1D22] hover:text-black'
                    }`}
                  >
                    Закрыть
                  </button>
                  <button
                    onClick={() => {
                      setIsEnlarged(false);
                      onSelectServiceForBooking(currentComparison.serviceId);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 shadow-md shadow-[#C57280]/20 min-h-[44px] flex items-center justify-center active:scale-98 transition-all"
                  >
                    Записаться на процедуру
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
