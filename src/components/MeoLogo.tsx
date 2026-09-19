import React, { useState, useEffect } from 'react';
import heroMeoLogoImg from '../assets/images/regenerated_image_1789849924701.png';
import headerMeoLogoImg from '../assets/images/regenerated_image_1789849925733.png';

export interface MeoLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'hero';
  showSubtitle?: boolean;
  showAddress?: boolean;
  isDark?: boolean;
  transparentBg?: boolean;
  src?: string;
  variant?: 'hero' | 'header' | 'default';
}

export const ORIGINAL_MEO_LOGO_URL = heroMeoLogoImg;
export const HERO_MEO_LOGO_URL = heroMeoLogoImg;
export const HEADER_MEO_LOGO_URL = headerMeoLogoImg;
const LOGO_VERSION = 'meo_logo_v6_png';

export const MeoLogo: React.FC<MeoLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showAddress = false,
  isDark = false,
  transparentBg = true,
  src,
  variant,
}) => {
  // Sizing configurations for responsive scaling
  const sizeClasses = {
    xs: 'w-8 h-8 sm:w-10 sm:h-10',
    sm: 'w-9 h-9 sm:w-12 sm:h-12',
    md: 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16',
    header: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
    lg: 'w-20 h-20 sm:w-28 sm:h-28',
    xl: 'w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64',
    xxl: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px]',
    hero: 'w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] lg:w-[500px] lg:h-[500px]',
  }[size];

  const defaultOfficialImg = src || (variant === 'hero' || size === 'hero' ? heroMeoLogoImg : headerMeoLogoImg);

  // Sources in order of priority:
  const fallbackSources = [
    defaultOfficialImg,
    headerMeoLogoImg,
    heroMeoLogoImg,
    '/meo_logo.webp?v=6',
    '/meo_logo.png?v=6',
    '/logo.jpg?v=6',
  ];

  const getInitialSource = () => {
    if (typeof window !== 'undefined') {
      const currentVersion = localStorage.getItem('meo_logo_version');
      if (currentVersion !== LOGO_VERSION) {
        localStorage.removeItem('meo_custom_logo');
        localStorage.setItem('meo_logo_version', LOGO_VERSION);
      }
      const custom = localStorage.getItem('meo_custom_logo');
      if (custom) return custom;
    }
    return defaultOfficialImg;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSource);
  const [sourceIndex, setSourceIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentSrc(getInitialSource());
  }, [src, variant, size]);

  useEffect(() => {
    const handleUpdate = () => {
      const custom = localStorage.getItem('meo_custom_logo');
      if (custom) {
        setCurrentSrc(custom);
      } else {
        setCurrentSrc(defaultOfficialImg);
        setSourceIndex(0);
      }
    };

    window.addEventListener('meo_logo_updated', handleUpdate);
    return () => window.removeEventListener('meo_logo_updated', handleUpdate);
  }, [defaultOfficialImg]);

  const handleImageError = () => {
    const nextIndex = sourceIndex + 1;
    if (nextIndex < fallbackSources.length) {
      setSourceIndex(nextIndex);
      setCurrentSrc(fallbackSources[nextIndex]);
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* 
        Official MEO Studio Logo:
        Directly renders the original image uploaded by the user:
        - "MEO" Didone typography
        - Delicate continuous contour line-art of the reclining woman
        - Mauve and slate grey organic backdrop blobs
        - Two-line subtitle: СТУДИЯ КОРРЕКЦИИ ФИГУРЫ И ЭСТЕТИЧЕСКОЙ КОСМЕТОЛОГИИ
      */}
      <div
        className={`relative shrink-0 ${sizeClasses} flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] ${
          transparentBg
            ? ''
            : isDark
            ? 'bg-white p-1.5 rounded-2xl border border-white/20 shadow-md'
            : 'bg-white p-1 rounded-2xl border border-[#E8D6DC] shadow-xs'
        }`}
      >
        <img
          src={currentSrc}
          alt="MEO — Студия коррекции фигуры и эстетической косметологии"
          className="w-full h-full object-contain pointer-events-none select-none rounded-xl"
          onError={handleImageError}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {/* Optional Companion Text for Header & Footers where address context is useful */}
      {showAddress && (
        <div className="hidden sm:flex flex-col text-left justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif font-black tracking-[0.18em] uppercase leading-none text-base sm:text-lg ${
                isDark ? 'text-white' : 'text-[#190F13]'
              }`}
            >
              MEO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C57280] shrink-0" />
          </div>

          <span
            className={`font-semibold uppercase tracking-wider text-[8px] sm:text-[9px] mt-0.5 leading-tight ${
              isDark ? 'text-[#E5B5BE]' : 'text-[#7A2B3C]'
            }`}
          >
            студия коррекции фигуры & косметологии
          </span>
          <span
            className={`text-[8.5px] sm:text-[9.5px] mt-0.5 leading-tight ${
              isDark ? 'text-[#B89FA4]' : 'text-[#4E393F]'
            }`}
          >
            Воронеж, ул. 9 Января, 233/40
          </span>
        </div>
      )}
    </div>
  );
};
