import React, { useState, useEffect, useRef } from 'react';
import { Lock, Key, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === '1234') {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  const handleKeyClick = (num: string) => {
    if (password.length < 8) {
      const next = password + num;
      setPassword(next);
      if (next === '1234') {
        setTimeout(() => onSuccess(), 100);
      }
    }
  };

  const handleBackspace = () => {
    setPassword((prev) => prev.slice(0, -1));
    setError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 transition-all ${
          isDark ? 'bg-[#181114] border-[#382329] text-white' : 'bg-white border-[#E8CCD5] text-black'
        } ${error ? 'animate-shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 bg-gradient-to-br from-[#7A2434] to-[#C57280] text-white flex items-center justify-center shadow-lg shadow-[#7A2434]/25">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold">Вход в панель управления</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#69535B]'}`}>
            Режим администратора студии MEO
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                maxLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Введите пароль..."
                className={`w-full text-center text-xl tracking-[0.3em] font-mono py-3 px-4 rounded-xl border outline-none transition-all ${
                  error
                    ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                    : isDark
                    ? 'bg-[#120B0E] border-[#382329] text-white focus:border-[#C57280]'
                    : 'bg-[#FAF4F6] border-[#DEC8CF] text-black focus:border-[#7A2434]'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 mt-2 font-medium">
                <ShieldAlert className="w-4 h-4" />
                <span>Неверный пароль. Доступ запрещен.</span>
              </div>
            )}
          </div>

          {/* Quick PIN pad for touch / mobile screens */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyClick(digit)}
                className={`py-2.5 rounded-xl font-mono text-base font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#22161A] border-[#382329] hover:bg-[#331F26] text-white'
                    : 'bg-[#FAF2F4] border-[#DEC8CF] hover:bg-[#F3E5E9] text-[#2E1D22]'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark ? 'bg-[#22161A] border-[#382329] text-neutral-400' : 'bg-[#FAF2F4] border-[#DEC8CF] text-neutral-600'
              }`}
            >
              Стереть
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className={`py-2.5 rounded-xl font-mono text-base font-bold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#22161A] border-[#382329] hover:bg-[#331F26] text-white'
                  : 'bg-[#FAF2F4] border-[#DEC8CF] hover:bg-[#F3E5E9] text-[#2E1D22]'
              }`}
            >
              0
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-xl text-xs font-bold bg-[#C57280] hover:bg-[#B6465B] text-white border border-[#C57280] transition-all cursor-pointer flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-serif text-xs font-bold text-white bg-gradient-to-r from-[#7A2434] to-[#C57280] hover:brightness-110 shadow-md transition-all cursor-pointer"
          >
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
};
