import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Clock, ArrowRight, X, User, BookOpen, Share2, Tag, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { NewsPost, NewsCategory } from '../types';
import { getNewsPosts } from '../utils/newsStorage';

interface NewsSectionProps {
  onOpenBooking: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onOpenBooking }) => {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState<NewsPost[]>(() => getNewsPosts());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<NewsPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleNewsUpdate = () => {
      setPosts(getNewsPosts());
    };
    window.addEventListener('meo_news_updated', handleNewsUpdate);
    return () => {
      window.removeEventListener('meo_news_updated', handleNewsUpdate);
    };
  }, []);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Все статьи' },
    { id: 'injections', label: 'Инъекции & Ботокс' },
    { id: 'advice', label: 'Советы косметолога' },
    { id: 'care', label: 'Коррекция тела' },
    { id: 'news', label: 'Новости студии' },
    { id: 'promo', label: 'Акции & Бонусы' },
  ];

  const filteredPosts = useMemo(() => {
    const published = posts.filter((p) => p.isPublished !== false);
    if (selectedCategory === 'all') return published;
    return published.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const handleShare = (post: NewsPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#news-${post.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getCategoryBadgeColor = (cat: NewsCategory) => {
    switch (cat) {
      case 'injections':
        return isDark ? 'bg-[#7A2434]/40 text-[#E8A5B2] border-[#C57280]/40' : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]';
      case 'advice':
        return isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800/40' : 'bg-amber-50 text-amber-900 border-amber-200';
      case 'care':
        return isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'news':
        return isDark ? 'bg-sky-950/40 text-sky-300 border-sky-800/40' : 'bg-sky-50 text-sky-900 border-sky-200';
      case 'promo':
        return isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800/40' : 'bg-rose-50 text-rose-900 border-rose-200';
      default:
        return isDark ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <section
      id="news"
      className={`py-14 sm:py-20 border-t transition-colors duration-300 relative ${
        isDark ? 'bg-[#181114] border-[#2A191E]' : 'bg-[#FAF6F8] border-[#E8CCD5]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-[#C57280]/15 text-[#C57280] border border-[#C57280]/25">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Бьюти-блог & Новости MEO</span>
          </div>

          <h2
            className={`font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 ${
              isDark ? 'text-white' : 'text-[#190F13]'
            }`}
          >
            Полезные статьи & новости студии
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-neutral-300' : 'text-[#554047]'
            }`}
          >
            Советы практикующих косметологов, научные аспекты аппаратного массажа, разбор инъекционных методик и актуальные события в MEO.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 min-h-[40px] rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer border flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white border-transparent shadow-xs'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-neutral-300 hover:border-neutral-500'
                      : 'bg-white border-[#DEC8CF] text-[#423136] hover:border-[#B6465B]'
                  }`}
                >
                  {cat.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-[#755E65]'}`}>
              В этой категории пока нет опубликованных статей.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => {
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{
                    duration: 0.35,
                    ease: 'easeOut',
                  }}
                  className="glass-liquid-card group rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 md:hover:-translate-y-1 shadow-sm hover:shadow-xl"
                >
                  {/* Article Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 cursor-pointer" onClick={() => setActiveArticle(post)}>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-xs ${getCategoryBadgeColor(
                        post.category
                      )}`}
                    >
                      {post.categoryLabel || post.category}
                    </span>

                    {post.featured && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C57280] text-white flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Топ
                      </span>
                    )}
                  </div>

                  {/* Article Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Info */}
                      <div className={`flex items-center gap-3 text-xs mb-2.5 ${isDark ? 'text-neutral-400' : 'text-[#755E65]'}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {post.publishedAt}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ~{post.readTimeMinutes || 3} мин
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => setActiveArticle(post)}
                        className={`font-serif text-lg font-bold tracking-tight mb-2.5 line-clamp-2 cursor-pointer transition-colors ${
                          isDark
                            ? 'text-white group-hover:text-[#E8A5B2]'
                            : 'text-[#190F13] group-hover:text-[#7A2434]'
                        }`}
                      >
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 ${isDark ? 'text-neutral-300' : 'text-[#4F3C42]'}`}>
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Author & Read Action */}
                    <div className="pt-3 border-t border-neutral-500/15 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#C57280]/20 flex items-center justify-center text-[#C57280]">
                          <User className="w-3 h-3" />
                        </div>
                        <span className={`text-xs font-medium truncate max-w-[120px] sm:max-w-[140px] ${isDark ? 'text-neutral-300' : 'text-[#3E2D33]'}`}>
                          {post.authorName || 'Студия MEO'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveArticle(post)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#C57280] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Читать</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 sm:backdrop-blur-sm overflow-y-auto">
          <div
            className={`relative w-full max-w-3xl rounded-t-3xl sm:rounded-2xl border shadow-2xl my-0 sm:my-auto overflow-hidden transition-all glass-liquid max-h-[90vh] flex flex-col ${
              isDark ? 'border-white/10 text-white' : 'border-[#E8CCD5] text-[#190F13]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-neutral-400/40 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Modal Close Button */}
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-3.5 right-3.5 z-20 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer active:scale-95"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Cover Image */}
            <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden bg-neutral-900 shrink-0">
              <img
                src={activeArticle.coverImage}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181114] via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-4 left-4 sm:left-6 flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${getCategoryBadgeColor(
                    activeArticle.category
                  )}`}
                >
                  {activeArticle.categoryLabel || activeArticle.category}
                </span>
                <span className="text-xs text-white/90 font-medium bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {activeArticle.publishedAt}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-8 max-h-[70vh] overflow-y-auto">
              <h2
                className={`font-serif text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-4 ${
                  isDark ? 'text-white' : 'text-[#190F13]'
                }`}
              >
                {activeArticle.title}
              </h2>

              {/* Author badge block */}
              <div className={`flex items-center justify-between pb-5 mb-6 border-b text-xs ${isDark ? 'border-white/10' : 'border-[#EAE0E3]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C57280]/20 flex items-center justify-center text-[#C57280]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                      {activeArticle.authorName || 'Косметолог студии MEO'}
                    </div>
                    <div className={isDark ? 'text-neutral-400' : 'text-[#755E65]'}>
                      {activeArticle.authorRole || 'Эксперт студии MEO'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShare(activeArticle)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border text-xs font-semibold cursor-pointer transition-colors active:scale-95 ${
                      isDark
                        ? 'border-white/10 text-neutral-300 hover:border-neutral-500 bg-white/5'
                        : 'border-[#DEC8CF] text-[#332026] hover:border-[#B6465B] bg-white'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#C57280]" />
                    <span>{copiedLink ? 'Ссылка скопирована!' : 'Поделиться'}</span>
                  </button>
                </div>
              </div>

              {/* Formatted Article Body */}
              <div
                className={`text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line ${
                  isDark ? 'text-neutral-200' : 'text-[#2E1D22]'
                }`}
              >
                {activeArticle.content}
              </div>

              {/* Bottom CTA Block */}
              <div
                className={`mt-8 p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-[#FCF5F7] border-[#E8CCD5]'
                }`}
              >
                <div>
                  <h4 className={`font-serif text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                    Хотите проконсультироваться со специалистом?
                  </h4>
                  <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-300' : 'text-[#5E484F]'}`}>
                    Запишитесь на удобное время — врач проведет диагностику и подберет персональный протокол.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveArticle(null);
                    onOpenBooking();
                  }}
                  className="w-full sm:w-auto shrink-0 px-6 py-3.5 rounded-xl font-serif text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#B83E58] to-[#C57280] shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px] active:scale-98"
                >
                  <span>Записаться на прием</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
