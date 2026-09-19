import { ServiceCategory } from '../types';

/**
 * Universal smooth scrolling and navigation helpers for MEO Studio
 * Handles sticky header offset, mobile drawer timing, and category switching
 */

export const scrollToSection = (
  targetId: string,
  options?: {
    offset?: number;
    category?: ServiceCategory | 'all';
    delay?: number;
  }
) => {
  const { offset, category, delay = 0 } = options || {};

  const executeScroll = () => {
    // If a category was requested, dispatch event so ServicesSection switches to it
    if (category) {
      window.dispatchEvent(
        new CustomEvent('meo_select_category', { detail: category })
      );
    }

    const cleanId = targetId.replace(/^#/, '');

    if (cleanId === 'top' || cleanId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(cleanId);
    if (!element) return;

    // Dynamically calculate sticky header height
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 70;
    const finalOffset = offset !== undefined ? offset : headerHeight + 12;

    const elementTop = element.getBoundingClientRect().top;
    const targetScrollY = Math.max(0, elementTop + window.pageYOffset - finalOffset);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  };

  if (delay > 0) {
    setTimeout(executeScroll, delay);
  } else {
    // Slight tick to allow any pending layout micro-updates
    requestAnimationFrame(executeScroll);
  }
};

/**
 * Jump directly to services section and filter by specific category
 */
export const goToServicesCategory = (
  category: ServiceCategory | 'all'
) => {
  scrollToSection('services', { category, offset: 75 });
};
