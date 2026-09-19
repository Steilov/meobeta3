import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Award, CheckCircle2, MessageSquarePlus, ExternalLink, ThumbsUp, MessageSquare } from 'lucide-react';
import { REVIEWS_DATA, SALON_INFO } from '../data/salonData';
import { Review } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ReviewsSectionProps {
  onOpenNewReviewModal: () => void;
  customReviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  onOpenNewReviewModal,
  customReviews,
}) => {
  const { isDark } = useTheme();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const allReviews = [...customReviews, ...REVIEWS_DATA];

  const filteredReviews = allReviews.filter((rev) => {
    if (filterRating === 'all') return true;
    return rev.rating === filterRating;
  });

  return (
    <section
      id="reviews"
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
              <span className={isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}>отзывы гостей</span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
              Впечатления{' '}
              <span className="text-[#C57280]">
                клиентов
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenNewReviewModal}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm bg-[#C57280] text-white hover:bg-[#A84758]"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Оставить отзыв</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Big Rating Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="glass-liquid-card rounded-2xl p-5 sm:p-8 border mb-8 sm:mb-10 transition-colors"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Score box */}
            <div className="md:col-span-5 flex items-center gap-3 sm:gap-4">
              <div
                className={`px-4 py-3 rounded-2xl flex flex-col items-center justify-center font-serif font-bold shrink-0 text-center ${
                  isDark ? 'bg-[#25181C] text-[#C57280] border border-white/10' : 'bg-[#FCEEF1] text-[#7A2434] border border-[#DEC8CF]'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold leading-tight">Отличный рейтинг</span>
                <span className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>Яндекс Карты</span>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[#C57280]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className={`font-serif font-bold text-xs sm:text-sm mt-1 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                  Отличный рейтинг на Яндекс Картах
                </div>
                <a
                  href={SALON_INFO.yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[11px] font-bold underline flex items-center gap-1 mt-1 min-h-[28px] ${
                    isDark ? 'text-neutral-300 hover:text-white' : 'text-[#2E1D22] hover:text-[#B6465B]'
                  }`}
                >
                  <span>ул. 9 Января, 233/40 на Картах</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Micro Highlights */}
            <div className={`md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-5 ${
              isDark ? 'border-white/10 text-neutral-300' : 'border-[#DEC8CF] text-[#190F13]'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Заметный результат уже после 1 процедуры</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Сертифицированные аппараты & косметика</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Комплексные программы: Тело + Лицо + Осанка</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#C57280]" />
                <span>Отличный рейтинг на Яндекс Картах</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rating Filter Tabs */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[40px] flex items-center active:scale-95 ${
                filterRating === 'all'
                  ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white shadow-xs'
                  : isDark ? 'bg-white/5 text-neutral-300 border border-white/10' : 'bg-[#F8F2F4] text-[#190F13] border border-[#DEC8CF] hover:bg-[#F0E6E9]'
              }`}
            >
              Все ({allReviews.length})
            </button>
            <button
              onClick={() => setFilterRating(5)}
              className={`px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] active:scale-95 ${
                filterRating === 5
                  ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white shadow-xs'
                  : isDark ? 'bg-white/5 text-neutral-300 border border-white/10' : 'bg-[#F8F2F4] text-[#190F13] border border-[#DEC8CF] hover:bg-[#F0E6E9]'
              }`}
            >
              <span>5 звезд</span>
              <Star className="w-3 h-3 fill-current text-amber-300" />
            </button>
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
            {filteredReviews.length} {filteredReviews.length === 1 ? 'отзыв' : 'отзывов'}
          </span>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredReviews.map((rev, index) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 38, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.55,
                delay: (index % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="glass-liquid-card rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isDark ? 'bg-[#25181C] text-[#C57280]' : 'bg-[#FCEEF1] text-[#7A2434] border border-[#DEC8CF]'
                      }`}
                    >
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div className={`font-serif text-xs font-bold flex items-center gap-1 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                        <span>{rev.author}</span>
                        {rev.verified && (
                          <CheckCircle2 className="w-3 h-3 text-[#C57280]" />
                        )}
                      </div>
                      {rev.userLevel && (
                        <div className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-[#E8A5B2]' : 'text-[#C57280]'}`}>
                          {rev.userLevel}
                        </div>
                      )}
                      <span className={`text-[10px] block ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-[#C57280] shrink-0">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {rev.service && (
                  <div className="mb-2.5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                      isDark ? 'bg-[#25181C] text-neutral-300' : 'bg-[#FCEEF1] text-[#7A2434] border border-[#DEC8CF]'
                    }`}>
                      {rev.service}
                    </span>
                  </div>
                )}

                <p className={`text-xs leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-neutral-300' : 'text-[#2E1D22]'
                }`}>
                  {rev.text}
                </p>

                {rev.hasReply && (
                  <div className={`mt-3 pt-2.5 border-t text-[11px] flex items-center gap-1.5 ${
                    isDark ? 'border-[#382329] text-neutral-400' : 'border-[#DEC8CF] text-[#2E1D22]'
                  }`}>
                    <MessageSquare className="w-3 h-3 text-[#C57280] shrink-0" />
                    <span className="font-semibold text-[10px]">Есть ответ организации</span>
                  </div>
                )}
              </div>

              <div className={`pt-3 mt-3 border-t text-[10px] flex items-center justify-between ${
                isDark ? 'border-[#382329] text-neutral-500' : 'border-[#DEC8CF] text-[#2E1D22]'
              }`}>
                <div className="flex items-center gap-2">
                  <span>{rev.source === 'yandex' ? 'Яндекс Карты' : 'Студия MEO'}</span>
                  {rev.likes && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-500/10 text-[10px]">
                      <ThumbsUp className="w-2.5 h-2.5 text-[#C57280]" />
                      <span>{rev.likes}</span>
                    </span>
                  )}
                </div>
                <span>Проверенный визит ✓</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
