import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Phone,
  Clock,
  Send,
  MessageCircle,
  Navigation,
  CheckCircle2,
  Car,
  ExternalLink,
  Star
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';

export const ContactsSection: React.FC = () => {
  const { isDark } = useTheme();
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSent, setCallbackSent] = useState(false);

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackSent(true);
  };

  return (
    <section
      id="contacts"
      className={`py-16 lg:py-24 border-t transition-colors scroll-mt-16 ${
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
              <span className={isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}>контакты & адрес студии</span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
              Как нас{' '}
              <span className="text-[#C57280]">
                найти
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={SALON_INFO.yandexMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${
                isDark
                  ? 'bg-[#1D1417] border-[#382329] text-[#C57280]'
                  : 'bg-[#FCEEF1] border-[#DEC8CF] text-[#7A2434]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-[#C57280]" />
              <span>Отличный рейтинг на Яндекс Картах</span>
            </a>
            <p className={`text-xs sm:text-sm max-w-sm hidden sm:block ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
              Воронеж, ул. 9 Января, 233/40. Парковка у входа.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Details & Callback */}
          <motion.div
            initial={{ opacity: 0, y: 38, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-4"
          >
            
            {/* Address */}
            <div className="glass-liquid-card p-4 sm:p-5 rounded-2xl border transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-[#25181C] text-[#C57280] border-transparent'
                    : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-serif text-base font-bold ${isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'}`}>
                    ул. 9 Января, 233/40
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    г. Воронеж • удобный подъезд и парковочные места перед входом
                  </p>
                  <a
                    href={SALON_INFO.yandexMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold underline mt-2.5 text-[#7A2434] hover:text-[#B6465B] min-h-[32px]"
                  >
                    <span>Открыть в Яндекс Картах (маршрут)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Phones & Messengers */}
            <div className="glass-liquid-card p-4 sm:p-5 rounded-2xl border transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-[#25181C] text-[#C57280] border-transparent'
                    : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]'
                }`}>
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-serif text-base font-bold ${isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'}`}>
                    Телефон для записи & консультаций
                  </h3>
                  <div className="mt-1.5 space-y-1 text-xs">
                    <div>
                      <a
                        href={`tel:${SALON_INFO.phoneMobileClean}`}
                        className={`text-base sm:text-sm font-bold inline-block py-1 ${isDark ? 'text-white hover:text-[#E8A5B2]' : 'text-[#190F13] hover:text-[#B6465B]'}`}
                      >
                        {SALON_INFO.phoneMobile}
                      </a>
                      <span className={`text-[11px] ml-1.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>(звонки и мессенджеры)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-500/20">
                    <a
                      href={SALON_INFO.vkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-[#0077FF] hover:bg-[#0066DD] text-white rounded-xl text-xs font-bold transition-all min-h-[44px] active:scale-95 shadow-sm"
                    >
                      <span className="font-extrabold text-xs">VK</span>
                      <span>ВКонтакте</span>
                    </a>
                    <a
                      href={SALON_INFO.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-xl text-xs font-bold transition-all min-h-[44px] active:scale-95 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="glass-liquid-card p-4 sm:p-5 rounded-2xl border transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? 'bg-[#25181C] text-[#C57280] border-transparent'
                    : 'bg-[#FCEEF1] text-[#7A2434] border-[#DEC8CF]'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-full text-xs">
                  <h3 className={`font-serif text-base font-bold ${isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'}`}>
                    График работы
                  </h3>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Понедельник — Пятница:</span>
                      <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>{SALON_INFO.workingHours.weekdays}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Суббота — Воскресенье:</span>
                      <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>{SALON_INFO.workingHours.weekends}</strong>
                    </div>
                    <p className={`text-[11px] pt-1 ${isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}`}>
                      {SALON_INFO.workingHours.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Callback */}
            <div className="glass-liquid-card p-4 sm:p-5 rounded-2xl border transition-colors">
              <h4 className={`font-serif text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                Консультация администратора
              </h4>
              <p className={`text-xs mb-3 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                Оставьте контакт — перезвоним в течение 5 минут и поможем подобрать процедуру.
              </p>

              {callbackSent ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Спасибо! Администратор студии MEO свяжется с вами в ближайшее время.</span>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    className={`w-full px-3.5 py-3 text-sm rounded-xl border outline-none min-h-[46px] transition-colors ${
                      isDark
                        ? 'bg-[#25181C] border-[#382329] text-white focus:border-[#C57280]'
                        : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                    }`}
                    required
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className={`w-full px-3.5 py-3 text-sm rounded-xl border outline-none min-h-[46px] transition-colors ${
                      isDark
                        ? 'bg-[#25181C] border-[#382329] text-white focus:border-[#C57280]'
                        : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                    }`}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[46px] bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white shadow-lg shadow-[#C57280]/20 hover:brightness-105"
                  >
                    Заказать консультацию
                  </motion.button>
                </form>
              )}
            </div>

          </motion.div>

          {/* Right Column: Embedded Yandex Map */}
          <motion.div
            initial={{ opacity: 0, y: 38, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="glass-liquid-card p-2 rounded-2xl border flex-1 flex flex-col min-h-[360px] sm:min-h-[440px]">
              <div className="relative w-full flex-1 rounded-xl overflow-hidden min-h-[320px] sm:min-h-[400px]">
                <iframe
                  title="Карта расположения студии MEO на ул. 9 Января, 233/40"
                  src="https://yandex.ru/map-widget/v1/?ll=39.119318%2C51.679326&z=16&pt=39.119318%2C51.679326%2Cpm2rdm"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen={true}
                  className="w-full h-full min-h-[320px] sm:min-h-[400px]"
                />
              </div>

              <div className={`p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${
                isDark ? 'text-neutral-400' : 'text-[#2E1D22]'
              }`}>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 shrink-0 text-[#C57280]" />
                  <span>Воронеж, ул. 9 Января, 233/40 • Парковка прямо перед входом в студию</span>
                </div>
                <a
                  href={SALON_INFO.yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#7A2434] hover:text-[#B6465B] py-1 inline-flex items-center gap-1"
                >
                  <span>Маршрут в Яндекс Картах</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
