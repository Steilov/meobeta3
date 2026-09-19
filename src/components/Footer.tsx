import React from 'react';
import { MapPin, Phone, Clock, Star, Sparkles, ArrowUp } from 'lucide-react';
import { SALON_INFO } from '../data/salonData';
import { useTheme } from '../context/ThemeContext';
import { MeoLogo } from './MeoLogo';
import { scrollToSection, goToServicesCategory } from '../utils/navigation';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenMyBookings }) => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`pt-12 pb-24 lg:pb-12 border-t transition-colors ${
        isDark
          ? 'bg-[#120B0E] text-[#D8C2C6] border-[#382329]'
          : 'bg-[#F5EDF0] text-[#1A1014] border-[#DEC8CF]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b ${
          isDark ? 'border-neutral-500/20' : 'border-[#DEC8CF]'
        }`}>
          
          {/* Brand */}
          <div className="lg:col-span-5 space-y-3 text-left">
            <div className="mb-2">
              <button
                onClick={() => scrollToSection('top')}
                className="cursor-pointer text-left bg-transparent border-0 p-0"
                aria-label="Наверх страницы"
              >
                <MeoLogo size="lg" isDark={isDark} showSubtitle={true} />
              </button>
            </div>

            <p className={`text-xs max-w-sm leading-relaxed ${isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}`}>
              Воронеж, ул. 9 Января, 233/40. Студия коррекции фигуры, аппаратного массажа, эстетической косметологии и восстановления осанки.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <a
                href={SALON_INFO.yandexMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                  isDark ? 'bg-[#1D1417] border-[#382329] text-white' : 'bg-white border-[#DEC8CF] text-[#190F13]'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-[#C57280] text-[#C57280]" />
                <span className="font-bold">Отличный рейтинг на Яндекс Картах</span>
              </a>

              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                isDark ? 'bg-[#1D1417] border-[#382329] text-neutral-300' : 'bg-white border-[#DEC8CF] text-[#2E1D22]'
              }`}>
                <Sparkles className="w-3 h-3 text-[#C57280]" />
                <span>Сертифицированные мастера</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-2 text-left">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
              Навигация
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className={`hover:underline transition-colors cursor-pointer text-left ${
                    isDark ? 'hover:text-[#C57280]' : 'hover:text-[#B6465B]'
                  }`}
                >
                  Каталог процедур и цен
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('portfolio')}
                  className={`hover:underline transition-colors cursor-pointer text-left ${
                    isDark ? 'hover:text-[#C57280]' : 'hover:text-[#B6465B]'
                  }`}
                >
                  Результаты До / После
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('reviews')}
                  className={`hover:underline transition-colors cursor-pointer text-left ${
                    isDark ? 'hover:text-[#C57280]' : 'hover:text-[#B6465B]'
                  }`}
                >
                  Отзывы клиентов
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`hover:underline transition-colors cursor-pointer text-left ${
                    isDark ? 'hover:text-[#C57280]' : 'hover:text-[#B6465B]'
                  }`}
                >
                  О студии и стандарты
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contacts')}
                  className={`hover:underline transition-colors cursor-pointer text-left ${
                    isDark ? 'hover:text-[#C57280]' : 'hover:text-[#B6465B]'
                  }`}
                >
                  Контакты и карта проезда
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMyBookings}
                  className={`hover:underline transition-colors cursor-pointer text-left ${
                    isDark ? 'hover:text-[#C57280]' : 'hover:text-[#B6465B]'
                  }`}
                >
                  Мои сохраненные записи
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                Направления процедур:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => goToServicesCategory('body')}
                  className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer ${
                    isDark
                      ? 'border-[#382329] text-neutral-300 hover:border-[#C57280] hover:text-white'
                      : 'border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B] hover:text-[#B6465B]'
                  }`}
                >
                  Тело & Похудение
                </button>
                <button
                  onClick={() => goToServicesCategory('face')}
                  className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer ${
                    isDark
                      ? 'border-[#382329] text-neutral-300 hover:border-[#C57280] hover:text-white'
                      : 'border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B] hover:text-[#B6465B]'
                  }`}
                >
                  Лицо & Пилинги
                </button>
                <button
                  onClick={() => goToServicesCategory('injections')}
                  className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer ${
                    isDark
                      ? 'border-[#382329] text-neutral-300 hover:border-[#C57280] hover:text-white'
                      : 'border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B] hover:text-[#B6465B]'
                  }`}
                >
                  Инъекции & Ботокс
                </button>
                <button
                  onClick={() => goToServicesCategory('posture')}
                  className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer ${
                    isDark
                      ? 'border-[#382329] text-neutral-300 hover:border-[#C57280] hover:text-white'
                      : 'border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B] hover:text-[#B6465B]'
                  }`}
                >
                  Осанка & Спина
                </button>
                <button
                  onClick={() => goToServicesCategory('packages')}
                  className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer ${
                    isDark
                      ? 'border-[#382329] text-neutral-300 hover:border-[#C57280] hover:text-white'
                      : 'border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B] hover:text-[#B6465B]'
                  }`}
                >
                  Комплексы
                </button>
              </div>
            </div>
          </div>

          {/* Quick Contacts */}
          <div className="lg:col-span-4 space-y-2 text-left text-xs">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
              Связь и адрес
            </div>
            <p className={`font-serif text-sm font-semibold ${isDark ? 'text-[#F7F1F2]' : 'text-[#190F13]'}`}>
              Воронеж, ул. 9 Января, 233/40
            </p>
            <p>
              <a href={`tel:${SALON_INFO.phoneMobileClean}`} className={`text-sm font-bold hover:underline ${isDark ? 'text-[#E8A5B2]' : 'text-[#7A2434]'}`}>
                {SALON_INFO.phoneMobile}
              </a>
            </p>
            <p className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>
              Ежедневно: {SALON_INFO.workingHours.weekdays} (по записи с 08:30 до 20:30)
            </p>
            
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-[#C57280] text-white hover:bg-[#A84758] shadow-md shadow-[#C57280]/20"
              >
                Забронировать визит
              </button>
              <a
                href={SALON_INFO.vkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 bg-[#0077FF] hover:bg-[#0066DD] text-white shadow-xs"
              >
                <span className="font-extrabold text-xs">VK</span>
                <span>ВКонтакте</span>
              </a>
            </div>
          </div>

        </div>

        <div className={`pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2 ${isDark ? 'text-neutral-400' : 'text-[#554047]'}`}>
          <div>© {new Date().getFullYear()} Студия коррекции фигуры и косметологии MEO (ул. 9 Января, 233/40)</div>
          <div className={`flex items-center gap-1 font-medium ${isDark ? 'text-[#C57280]' : 'text-[#7A2434]'}`}>
            <span>Красота начинается со здоровья</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
