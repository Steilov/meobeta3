import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Clock, Sparkles, ArrowRight, ArrowLeft, MessageSquare, UserCheck, Calendar as CalendarIcon, Phone, Lock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SALON_INFO } from '../data/salonData';
import { Booking, ServiceCategory, ServiceItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { MeoLogo } from './MeoLogo';
import { getAllSlotsForDate, isSlotAvailable, blockSlot, isTimePassedForDate, isSlotBlocked, getTodayIso } from '../utils/scheduleStorage';
import { sendVkBookingNotification } from '../utils/vkNotification';
import { getStoredServices } from '../utils/servicesStorage';
import { createBookingOnServer } from '../utils/syncManager';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
  preselectedAdditionalIds?: string[];
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
  preselectedAdditionalIds,
  onBookingSuccess,
}) => {
  const { isDark } = useTheme();
  const [allServices, setAllServices] = useState<ServiceItem[]>(getStoredServices);
  // Steps: 1 = Service, 2 = Date & Time, 3 = Contacts, 4 = Success
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [additionalServices, setAdditionalServices] = useState<ServiceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientComment, setClientComment] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);


  // Generate 14 available days
  const availableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = [
      'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      const dayNum = d.getDate();
      const dayName = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : daysOfWeek[d.getDay()];
      const monthName = months[d.getMonth()];
      dates.push({ iso, dayNum, dayName, monthName });
    }
    return dates;
  }, []);

  // Schedule state synchronized with Admin Panel & minute timer for real-time passed slot updates
  const [scheduleVersion, setScheduleVersion] = useState(0);

  useEffect(() => {
    const handleScheduleSync = () => setScheduleVersion((v) => v + 1);
    window.addEventListener('meo_schedule_updated', handleScheduleSync);

    // Refresh every 30 seconds so slots that just passed (e.g. 14:00) automatically disable in real-time
    const interval = setInterval(() => {
      setScheduleVersion((v) => v + 1);
    }, 30000);

    return () => {
      window.removeEventListener('meo_schedule_updated', handleScheduleSync);
      clearInterval(interval);
    };
  }, []);

  const timeSlots = React.useMemo(() => {
    if (!selectedDate) return [];
    return getAllSlotsForDate(selectedDate);
  }, [selectedDate, scheduleVersion]);

  // If selectedTime is no longer available on this date, reset it
  useEffect(() => {
    if (selectedDate && selectedTime) {
      if (!isSlotAvailable(selectedDate, selectedTime)) {
        setSelectedTime('');
      }
    }
  }, [selectedDate, selectedTime, scheduleVersion]);

  useEffect(() => {
    const handleServicesUpdate = () => {
      setAllServices(getStoredServices());
    };
    window.addEventListener('meo_services_updated', handleServicesUpdate);
    return () => {
      window.removeEventListener('meo_services_updated', handleServicesUpdate);
    };
  }, []);

  useEffect(() => {
    if (preselectedServiceId) {
      const found = allServices.find((s) => s.id === preselectedServiceId);
      if (found) {
        setSelectedService(found);
        setSelectedCategory(found.category);
        if (preselectedAdditionalIds && preselectedAdditionalIds.length > 0) {
          const additional = preselectedAdditionalIds
            .map((id) => allServices.find((s) => s.id === id))
            .filter((s): s is ServiceItem => Boolean(s));
          setAdditionalServices(additional);
        } else {
          setAdditionalServices([]);
        }
        setStep(2);
      }
    } else {
      setAdditionalServices([]);
    }
    if (availableDates.length > 0 && !selectedDate) {
      // Find the first date that has at least one available slot
      const firstAvailableDate = availableDates.find((d) => {
        const slots = getAllSlotsForDate(d.iso);
        return slots.some((t) => isSlotAvailable(d.iso, t));
      });
      setSelectedDate(firstAvailableDate ? firstAvailableDate.iso : availableDates[0].iso);
    }
  }, [preselectedServiceId, preselectedAdditionalIds, availableDates, allServices]);

  const additionalTotal = additionalServices.reduce((sum, s) => sum + s.priceFrom, 0);
  const isConsultationPrice = selectedService?.priceOnConsultation || false;
  const totalPrice = (selectedService?.priceFrom || 0) + additionalTotal;
  const totalDuration = (selectedService?.durationMinutes || 0) + additionalServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleToggleAdditional = (item: ServiceItem) => {
    setAdditionalServices((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) {
        return prev.filter((s) => s.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    setConflictError(null);
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName.trim() || !clientPhone.trim() || isSubmitting) {
      return;
    }

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      additionalServices: additionalServices.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.priceFrom,
        duration: a.durationMinutes,
      })),
      masterId: 'any',
      masterName: 'Свободный мастер',
      date: selectedDate,
      timeSlot: selectedTime,
      price: totalPrice,
      durationMinutes: totalDuration,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientComment: clientComment.trim(),
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    setIsSubmitting(true);
    setConflictError(null);

    const result = await createBookingOnServer(newBooking);
    setIsSubmitting(false);

    if (!result.success) {
      setConflictError(
        result.error ||
          `Выбранное время (${selectedTime} на ${selectedDate}) только что занял другой клиент. Пожалуйста, выберите другое свободное окно!`
      );
      setSelectedTime('');
      setStep(2);
      return;
    }

    // Also update local storage cache immediately
    blockSlot(selectedDate, selectedTime, 'Онлайн-запись с сайта', `${clientName.trim()} (${clientPhone.trim()})`);

    const finalBooking = result.booking || newBooking;
    setConfirmedBooking(finalBooking);
    onBookingSuccess(finalBooking);
    setStep(4);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: isDark ? ['#C57280', '#FFFFFF', '#382329'] : ['#C57280', '#2C2023', '#F4D9DF'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleReset = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedService(null);
      setAdditionalServices([]);
      setSelectedTime('');
      setClientName('');
      setClientPhone('');
      setClientComment('');
      setConfirmedBooking(null);
      setConflictError(null);
      setIsSubmitting(false);
    }, 300);
  };

  const filteredServices = selectedCategory === 'all'
    ? allServices
    : allServices.filter((s) => s.category === selectedCategory);

  const availableAdditionals = allServices.filter(
    (s) => s.id !== selectedService?.id && (s.category === selectedService?.category || s.popular)
  ).slice(0, 4);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 sm:backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-transparent"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border relative text-left shadow-2xl transition-colors z-10 glass-liquid ${
              isDark ? 'border-white/10 text-[#F7F1F2]' : 'border-[#DEC8CF] text-[#190F13]'
            }`}
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-neutral-400/40 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className={`px-4 sm:px-5 py-3 sm:py-3.5 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'border-white/10' : 'border-[#DEC8CF] bg-white/40'
            }`}>
              <div className="flex items-center gap-2.5">
                <MeoLogo size="sm" isDark={isDark} showSubtitle={false} />
                <div>
                  <h3 className={`font-serif text-sm sm:text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                    Онлайн-запись в студию «MEO»
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}`}>ул. 9 Января, 233/40 • Воронеж</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className={`w-10 h-10 rounded-xl cursor-pointer transition-colors flex items-center justify-center ${
                  isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10 active:bg-white/15' : 'text-[#554047] hover:text-[#190F13] hover:bg-black/5 active:bg-black/10'
                }`}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Tracker (3 steps) */}
            {step <= 3 && (
              <div className={`px-4 sm:px-5 py-2 border-b text-[11px] font-medium flex items-center justify-between shrink-0 ${
                isDark ? 'bg-[#191013] border-[#382329] text-neutral-400' : 'bg-[#F5EDF0] border-[#DEC8CF] text-[#1A1014]'
              }`}>
                <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#C57280] font-bold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    step >= 1 ? 'bg-[#C57280] text-white' : 'bg-neutral-700 text-neutral-300'
                  }`}>1</span>
                  <span>Услуга</span>
                </div>
                <span className="text-neutral-500">→</span>
                <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#C57280] font-bold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    step >= 2 ? 'bg-[#C57280] text-white' : 'bg-neutral-700 text-neutral-300'
                  }`}>2</span>
                  <span>Дата & Время</span>
                </div>
                <span className="text-neutral-500">→</span>
                <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#C57280] font-bold' : ''}`}>
                  <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    step >= 3 ? 'bg-[#C57280] text-white' : 'bg-neutral-700 text-neutral-300'
                  }`}>3</span>
                  <span>Контакты</span>
                </div>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
              <AnimatePresence mode="wait">
                {/* STEP 1: Service */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className={`font-serif text-sm font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                        Выберите желаемую услугу:
                      </h4>
                      <span className="text-[11px] text-[#C57280] font-bold">Шаг 1 из 3</span>
                    </div>

                    {/* Category selector pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'all', label: 'Все' },
                        { id: 'body', label: 'Тело' },
                        { id: 'face', label: 'Лицо' },
                        { id: 'posture', label: 'Осанка' },
                        { id: 'packages', label: 'Комплексы' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCategory(c.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                            selectedCategory === c.id
                              ? 'bg-[#C57280] text-white shadow-xs'
                              : isDark ? 'bg-[#1D1417] text-neutral-400 hover:text-white' : 'bg-[#F8F2F4] text-[#190F13] border border-[#DEC8CF] hover:bg-[#F0E6E9]'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    {/* Services list */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredServices.map((service) => (
                        <motion.div
                          key={service.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleServiceSelect(service)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selectedService?.id === service.id
                              ? isDark ? 'border-[#C57280] bg-[#C57280]/10' : 'border-[#C57280] bg-[#FFF2F5]'
                              : isDark ? 'border-[#382329] hover:border-neutral-500 bg-[#1D1417]' : 'border-[#DEC8CF] hover:border-[#B6465B] bg-white'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-[#190F13]'}`}>{service.name}</span>
                              {service.popular && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 ${
                                  isDark ? 'bg-[#25181C] text-[#C57280]' : 'bg-[#FCEEF1] text-[#7A2434]'
                                }`}>
                                  Топ
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                              {service.description}
                            </p>
                            <div className={`flex items-center gap-2 mt-1 text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#554047]'}`}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-neutral-500" />
                                {service.durationMinutes} мин
                              </span>
                              <span>•</span>
                              <span className={`font-bold ${isDark ? 'text-neutral-300' : 'text-[#190F13]'}`}>
                                {service.priceOnConsultation
                                  ? (service.priceLabel || 'По согласованию')
                                  : service.priceTo
                                  ? `${service.priceFrom.toLocaleString('ru-RU')} – ${service.priceTo.toLocaleString('ru-RU')} ₽`
                                  : `от ${service.priceFrom.toLocaleString('ru-RU')} ₽`}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold shrink-0 text-[#C57280]">Выбрать →</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Date & Time + Free Master confirmation */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-serif text-sm font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>Дата и время визита</h4>
                        <p className={`text-[11px] ${isDark ? 'text-[#D8C2C6]' : 'text-[#2E1D22]'}`}>
                          {selectedService?.name} • {selectedService?.priceOnConsultation ? (selectedService?.priceLabel || 'По согласованию') : `от ${selectedService?.priceFrom} ₽`}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className={`text-xs flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg ${
                          isDark ? 'text-neutral-400 hover:text-white' : 'text-[#2E1D22] hover:text-[#B6465B]'
                        }`}
                      >
                        <ArrowLeft className="w-3 h-3" /> Назад
                      </button>
                    </div>

                    {/* Real-time conflict error notice if another client took slot */}
                    {conflictError && (
                      <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-rose-200">Время уже занято:</strong>
                          <span>{conflictError}</span>
                        </div>
                      </div>
                    )}

                    {/* Master choice banner: ONLY FREE MASTER */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-[#FCEEF1] border-[#DEC8CF]'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#C57280]/20 text-[#C57280] flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                            <span>Свободный специалист</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#C57280] text-white">
                              Выбрано
                            </span>
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            Студия MEO назначит сертифицированного специалиста
                          </div>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-[#C57280] shrink-0" />
                    </div>

                    {/* Dates Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                          <CalendarIcon className="w-3 h-3 text-[#C57280]" /> День визита:
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-[#554047]'}`}>Листайте вправо →</span>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                        {availableDates.map((d) => {
                          const isSelected = selectedDate === d.iso;
                          return (
                            <button
                              key={d.iso}
                              type="button"
                              onClick={() => setSelectedDate(d.iso)}
                              className={`p-2 rounded-xl text-center border transition-all cursor-pointer min-w-[58px] shrink-0 snap-start ${
                                isSelected
                                  ? 'bg-[#C57280] text-white border-[#C57280] shadow-sm'
                                  : isDark
                                    ? 'bg-[#1D1417] border-[#382329] text-neutral-300 hover:border-neutral-500'
                                    : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B]'
                              }`}
                            >
                              <div className="text-[9px] uppercase font-bold">{d.dayName}</div>
                              <div className="text-base font-bold my-0.5">{d.dayNum}</div>
                              <div className="text-[9px] opacity-80">{d.monthName}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                          <Clock className="w-3 h-3 text-[#C57280]" /> Свободные окна (каждые 2 часа):
                        </div>
                        <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-[#6B535C]'}`}>
                          Официально: 10:00 – 22:00 (слоты с 08:30 до 20:30)
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const isPassed = isTimePassedForDate(selectedDate, time);
                          const isBlocked = Boolean(isSlotBlocked(selectedDate, time));
                          const isAvailable = !isPassed && !isBlocked;
                          const isSelected = selectedTime === time;

                          if (isPassed) {
                            return (
                              <div
                                key={time}
                                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 min-h-[42px] select-none opacity-40 cursor-not-allowed ${
                                  isDark
                                    ? 'bg-[#150F11] border-[#221316] text-neutral-500'
                                    : 'bg-neutral-100/80 border-[#E8DDDF] text-neutral-400'
                                }`}
                                title="Время уже прошло"
                              >
                                <Clock className="w-3 h-3 text-neutral-400 opacity-60" />
                                <span className="line-through">{time}</span>
                              </div>
                            );
                          }

                          if (isBlocked) {
                            return (
                              <div
                                key={time}
                                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 min-h-[42px] select-none opacity-45 cursor-not-allowed ${
                                  isDark
                                    ? 'bg-[#181113] border-[#2A181C] text-neutral-500'
                                    : 'bg-neutral-100 border-[#E5D7DA] text-neutral-400'
                                }`}
                                title="Это время занято (запись по телефону или бронь)"
                              >
                                <Lock className="w-3 h-3 text-rose-400/70" />
                                <span className="line-through">{time}</span>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] ${
                                isSelected
                                  ? 'bg-[#C57280] text-white border-[#C57280] shadow-sm'
                                  : isDark
                                    ? 'bg-[#1D1417] border-[#382329] text-neutral-300 hover:border-neutral-500'
                                    : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] hover:border-[#B6465B]'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{time}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Notice if no slots available for selected date */}
                      {timeSlots.length > 0 && timeSlots.every((t) => !isSlotAvailable(selectedDate, t)) && (
                        <div className={`mt-2 p-2.5 rounded-xl border text-xs text-center ${
                          isDark ? 'bg-[#221316] border-[#382329] text-neutral-300' : 'bg-[#FAF0F3] border-[#E8CCD5] text-[#5E3F47]'
                        }`}>
                          На эту дату все окна уже заняты или прошли. Пожалуйста, выберите следующий день.
                        </div>
                      )}
                    </div>

                    {/* Optional Add-ons */}
                    {availableAdditionals.length > 0 && (
                      <div className="pt-1">
                        <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                          Добавить к записи (по желанию):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {availableAdditionals.map((add) => {
                            const isAdded = additionalServices.some((s) => s.id === add.id);
                            return (
                              <div
                                key={add.id}
                                onClick={() => handleToggleAdditional(add)}
                                className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between text-xs ${
                                  isAdded
                                    ? 'border-[#C57280] bg-[#C57280]/15'
                                    : isDark ? 'border-[#382329] bg-[#1D1417]/60' : 'border-[#DEC8CF] bg-white text-[#190F13]'
                                }`}
                              >
                                <span className="font-semibold truncate pr-1">{add.name}</span>
                                <span className="text-[11px] font-bold shrink-0 text-[#C57280]">
                                  {isAdded ? '✓' : `+${add.priceFrom} ₽`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Client Info */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleFinalSubmit} id="booking-final-form" className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>Контакты для подтверждения</h4>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className={`text-xs flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg ${
                            isDark ? 'text-neutral-400 hover:text-white' : 'text-[#2E1D22] hover:text-[#B6465B]'
                          }`}
                        >
                          <ArrowLeft className="w-3 h-3" /> Назад
                        </button>
                      </div>

                      {/* Summary card */}
                      <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-[#FCEEF1] border-[#DEC8CF]'
                      }`}>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Услуга:</span>
                          <strong className={`text-right ${isDark ? 'text-white' : 'text-[#190F13]'}`}>{selectedService?.name}</strong>
                        </div>
                        {additionalServices.length > 0 && (
                          <div className={`flex justify-between text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            <span>Дополнительно:</span>
                            <span>{additionalServices.map(a => a.name).join(', ')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Специалист:</span>
                          <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>Свободный специалист студии MEO</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Дата и время:</span>
                          <strong className="text-[#C57280]">
                            {selectedDate} в {selectedTime}
                          </strong>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-neutral-500/20">
                          <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>
                            {isConsultationPrice ? 'Стоимость:' : 'Итого от:'}
                          </span>
                          <div className="text-right">
                            {isConsultationPrice ? (
                              <div>
                                <strong className="text-xs sm:text-sm font-bold text-[#C57280]">
                                  {additionalTotal > 0 ? `от ${additionalTotal.toLocaleString('ru-RU')} ₽ + ` : ''}По согласованию
                                </strong>
                                <div className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-[#755E65]'}`}>
                                  расчет по выбранному препарату
                                </div>
                              </div>
                            ) : (
                              <strong className="text-sm font-bold text-[#C57280]">
                                {totalPrice.toLocaleString('ru-RU')} ₽
                              </strong>
                            )}
                          </div>
                        </div>
                      </div>

                      {isConsultationPrice && (
                        <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                          isDark ? 'bg-[#25171B] border-[#C57280]/30 text-[#E5B5BE]' : 'bg-[#FAF0F3] border-[#E8CCD5] text-[#7A2434]'
                        }`}>
                          <Sparkles className="w-4 h-4 shrink-0 text-[#C57280] mt-0.5" />
                          <div>
                            <strong className="block mb-0.5">Индивидуальный расчет на консультации</strong>
                            <span>Препарат (бренд, плотность) и необходимый объем рассчитываются дипломированным врачом-косметологом на очном осмотре перед процедурой.</span>
                          </div>
                        </div>
                      )}

                      {/* Inputs optimized for mobile */}
                      <div className="space-y-2.5">
                        <div>
                          <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            Ваше имя *
                          </label>
                          <input
                            type="text"
                            required
                            autoComplete="name"
                            placeholder="Как к вам обращаться"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border outline-none transition-colors ${
                              isDark
                                ? 'bg-[#1D1417] border-[#382329] text-white focus:border-[#C57280]'
                                : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            Номер телефона *
                          </label>
                          <input
                            type="tel"
                            required
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+7 (___) ___-__-__"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border outline-none transition-colors ${
                              isDark
                                ? 'bg-[#1D1417] border-[#382329] text-white focus:border-[#C57280]'
                                : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                            Комментарий или пожелания (необязательно)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Пожелания по зонам, противопоказания..."
                            value={clientComment}
                            onChange={(e) => setClientComment(e.target.value)}
                            className={`w-full px-3.5 py-2 text-sm sm:text-xs rounded-xl border outline-none transition-colors resize-none ${
                              isDark
                                ? 'bg-[#1D1417] border-[#382329] text-white focus:border-[#C57280]'
                                : 'bg-[#F8F2F4] border-[#DEC8CF] text-[#190F13] placeholder:text-[#8E7E84] focus:border-[#B6465B]'
                            }`}
                          />
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* STEP 4: Success */}
                {step === 4 && confirmedBooking && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-3 space-y-3.5"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C57280] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#C57280]/25">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>

                    <div>
                      <h4 className={`font-serif text-xl font-bold ${isDark ? 'text-white' : 'text-[#190F13]'}`}>
                        Запись подтверждена!
                      </h4>
                      <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                        Ждем вас, {confirmedBooking.clientName}, в студии «MEO» на ул. 9 Января, 233/40
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border text-xs text-left max-w-sm mx-auto space-y-1.5 ${
                      isDark ? 'bg-[#1D1417] border-[#382329]' : 'bg-[#FCEEF1] border-[#DEC8CF]'
                    }`}>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Услуга:</span>
                        <strong className={`text-right ${isDark ? 'text-white' : 'text-[#190F13]'}`}>{confirmedBooking.serviceName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Специалист:</span>
                        <strong className={isDark ? 'text-white' : 'text-[#190F13]'}>{confirmedBooking.masterName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>Дата & Время:</span>
                        <strong className="text-[#C57280]">
                          {confirmedBooking.date} в {confirmedBooking.timeSlot}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-neutral-500/20">
                        <span className={isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}>
                          {confirmedBooking.category === 'injections' || confirmedBooking.price === 0 ? 'Стоимость:' : 'Сумма от:'}
                        </span>
                        <strong className="text-xs sm:text-sm font-bold text-[#C57280]">
                          {confirmedBooking.category === 'injections' || confirmedBooking.price === 0
                            ? 'По согласованию (после подбора препарата)'
                            : `${confirmedBooking.price.toLocaleString('ru-RU')} ₽`}
                        </strong>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <a
                        href={SALON_INFO.vkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-3 bg-[#0077FF] hover:bg-[#0066DD] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <span className="font-extrabold text-xs">VK</span>
                        <span>Написать ВКонтакте</span>
                      </a>

                      <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors bg-[#C57280] text-white hover:bg-[#A84758]"
                      >
                        Готово
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Mobile/Desktop Footer Controls */}
            {step < 4 && (
              <div className={`p-3.5 sm:p-4 border-t shrink-0 flex items-center justify-between gap-2.5 pb-safe ${
                isDark ? 'border-white/10 bg-[#191013]/90 backdrop-blur-md' : 'border-[#DEC8CF] bg-white/80 backdrop-blur-md'
              }`}>
                {step === 1 && (
                  <div className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-[#2E1D22]'}`}>
                    Выберите услугу из каталога выше
                  </div>
                )}

                {step === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={`px-3.5 py-2.5 min-h-[46px] text-xs font-bold flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors active:scale-95 ${
                        isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-[#2E1D22] hover:text-[#B6465B] hover:bg-black/5'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" /> <span>Назад</span>
                    </button>

                    <button
                      disabled={!selectedDate || !selectedTime}
                      onClick={handleDateTimeConfirm}
                      className={`flex-1 sm:flex-none px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px] active:scale-98 ${
                        selectedDate && selectedTime
                          ? 'bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 shadow-md shadow-[#C57280]/25'
                          : 'opacity-40 cursor-not-allowed bg-neutral-600 text-neutral-300'
                      }`}
                    >
                      <span>Продолжить</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {step === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className={`px-3.5 py-2.5 min-h-[46px] text-xs font-bold flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors active:scale-95 ${
                        isDark ? 'text-neutral-400 hover:text-white hover:bg-white/5' : 'text-[#2E1D22] hover:text-[#B6465B] hover:bg-black/5'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" /> <span>Назад</span>
                    </button>

                    <button
                      type="submit"
                      form="booking-final-form"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-[#B83E58] to-[#C57280] text-white hover:brightness-105 shadow-[#C57280]/25 min-h-[46px] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Бронирование...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Подтвердить запись</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
