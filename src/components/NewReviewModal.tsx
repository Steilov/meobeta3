import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { Review } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Review) => void;
}

export const NewReviewModal: React.FC<NewReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const { isDark } = useTheme();
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [service, setService] = useState('');
  const [text, setText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;

    const newRev: Review = {
      id: 'rev-user-' + Date.now(),
      author: author.trim(),
      date: 'Сегодня',
      rating,
      source: 'site',
      text: text.trim(),
      service: service.trim() || undefined,
      verified: true,
      avatarColor: 'bg-[#C57280] text-white',
    };

    onSubmitReview(newRev);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setAuthor('');
      setText('');
      setService('');
      setRating(5);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`rounded-2xl max-w-md w-full overflow-hidden border relative text-left my-6 flex flex-col shadow-2xl transition-colors ${
              isDark ? 'bg-[#150F11] border-[#382329] text-[#F7F1F2]' : 'bg-white border-[#DEC8CF] text-[#190F13]'
            }`}
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between ${
              isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-[#F8F2F4] border-[#DEC8CF]'
            }`}>
              <div>
                <h3 className={`font-serif text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                  <span>Оставить отзыв о студии «MEO»</span>
                  <span className="w-2 h-2 rounded-full bg-[#C57280]" />
                </h3>
                <p className={`text-xs ${isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}`}>ул. 9 Января, 233/40 • Воронеж</p>
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-xl cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                  isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-[#554047] hover:text-[#190F13] hover:bg-black/5'
                }`}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-[#C57280] text-white shadow-lg shadow-[#C57280]/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className={`font-serif text-lg font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                  Спасибо за ваш отзыв!
                </h4>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                  Ваш отзыв опубликован на сайте студии «MEO».
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Rating Stars */}
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Оценка работы специалистов студии:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = hoverRating ? star <= hoverRating : star <= rating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1.5 text-amber-400 cursor-pointer transition-transform active:scale-90"
                        >
                          <Star
                            className={`w-7 h-7 ${filled ? 'fill-amber-400 text-amber-400' : isDark ? 'stroke-neutral-500 fill-none' : 'stroke-[#8E7E84] fill-none'}`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-[#C57280]">
                      {rating} из 5
                    </span>
                  </div>
                </div>

                {/* Author */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Екатерина"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none min-h-[44px] transition-colors ${
                      isDark
                        ? 'bg-[#1D1417] border-[#382329] text-white focus:border-[#C57280]'
                        : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                    }`}
                  />
                </div>

                {/* Service */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Процедура
                  </label>
                  <input
                    type="text"
                    placeholder="LPG-массаж, RF-лифтинг, Кавитация..."
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none min-h-[44px] transition-colors ${
                      isDark
                        ? 'bg-[#1D1417] border-[#382329] text-white focus:border-[#C57280]'
                        : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                    }`}
                  />
                </div>

                {/* Text */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Текст отзыва *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Поделитесь вашими впечатлениями от визита в студию «MEO»..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition-colors ${
                      isDark
                        ? 'bg-[#1D1417] border-[#382329] text-white focus:border-[#C57280]'
                        : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[44px] bg-[#C57280] text-white shadow-lg shadow-[#C57280]/25 hover:bg-[#A84758]"
                  >
                    Опубликовать отзыв
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
