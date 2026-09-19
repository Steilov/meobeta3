import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Trash2, Sparkles } from 'lucide-react';
import { Booking } from '../types';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onOpenBooking: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onOpenBooking,
}) => {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`rounded-t-3xl sm:rounded-2xl max-w-lg w-full overflow-hidden border relative text-left my-0 sm:my-6 flex flex-col max-h-[88vh] shadow-2xl transition-colors glass-liquid ${
              isDark ? 'border-white/10 text-[#F7F1F2]' : 'border-[#DEC8CF] text-[#190F13]'
            }`}
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-neutral-400/40 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-[#DEC8CF] bg-white/40'
            }`}>
              <div>
                <h3 className={`font-serif text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                  <span>Мои записи в студию MEO</span>
                  <span className="w-2 h-2 rounded-full bg-[#C57280]" />
                </h3>
                <p className={`text-xs ${isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}`}>ул. 9 Января, 233/40 • Воронеж</p>
              </div>

              <button
                onClick={onClose}
                className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-colors ${
                  isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10 active:bg-white/15' : 'text-[#554047] hover:text-[#190F13] hover:bg-black/5 active:bg-black/10'
                }`}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {bookings.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#C57280]/10 text-[#C57280]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className={`font-serif text-sm font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                    У вас пока нет активных записей
                  </h4>
                  <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Выберите желаемую процедуру коррекции тела, лица или массажа и забронируйте удобное время визита.
                  </p>
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        onClose();
                        onOpenBooking();
                      }}
                      className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all bg-[#C57280] hover:bg-[#A84758] text-white shadow-lg shadow-[#C57280]/25 min-h-[44px]"
                    >
                      Записаться на процедуру
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border space-y-2.5 ${
                        isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-[#FCEEF1] border-[#DEC8CF]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className={`font-serif font-bold text-sm ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                            {item.serviceName}
                          </div>
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            Специалист: <span className={`font-semibold ${isDark ? 'text-[#C57280]' : 'text-[#7A2434]'}`}>{item.masterName || 'Специалист студии MEO'}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30 ${
                          isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}>
                          Подтверждено
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                        isDark ? 'bg-[#150F11]' : 'bg-white border border-[#DEC8CF] text-[#190F13]'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C57280]" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C57280]" />
                          <span>{item.timeSlot}</span>
                        </div>
                        <div>
                          <strong className={`text-sm font-bold ${isDark ? 'text-[#C57280]' : 'text-[#7A2434]'}`}>{item.price} ₽</strong>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onCancelBooking(item.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Отменить бронь</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  <p className={`text-[11px] pt-2 text-center ${isDark ? 'text-neutral-400' : 'text-[#554047]'}`}>
                    Для переноса времени свяжитесь со студией: <a href={`tel:${SALON_INFO.phoneClean}`} className={`underline ${isDark ? 'text-[#C57280]' : 'text-[#7A2434]'}`}>{SALON_INFO.phone}</a>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-5 py-3 border-t flex justify-end ${
              isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-[#FAF3F5] border-[#DEC8CF]'
            }`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer min-h-[40px] ${
                  isDark ? 'border-[#382329] text-neutral-200 hover:bg-neutral-500/10' : 'border-[#DEC8CF] text-[#190F13] hover:bg-[#F0E6E9]'
                }`}
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
