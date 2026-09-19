/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { NewsSection } from './components/NewsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ReviewsSection } from './components/ReviewsSection';
import { AboutSection } from './components/AboutSection';
import { ContactsSection } from './components/ContactsSection';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { NewReviewModal } from './components/NewReviewModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Booking, Review } from './types';
import { useTheme } from './context/ThemeContext';
import { initRealtimeSync, cancelBookingOnServer, createReviewOnServer, STORAGE_KEYS } from './utils/syncManager';

export default function App() {
  const { isDark } = useTheme();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [preselectedAdditionalIds, setPreselectedAdditionalIds] = useState<string[] | undefined>(undefined);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isNewReviewOpen, setIsNewReviewOpen] = useState(false);

  // Admin Panel & Authentication states
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Current client's personal bookings (for "My Bookings" modal)
  const [myBookings, setMyBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_BOOKINGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // All bookings from server (for Admin Panel and global verification)
  const [allServerBookings, setAllServerBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_BOOKINGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User reviews synchronized from server
  const [customReviews, setCustomReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_REVIEWS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize real-time synchronization with server on mount
  useEffect(() => {
    const cleanup = initRealtimeSync();

    const handleBookingsUpdate = (e: any) => {
      const serverList = e.detail || [];
      if (Array.isArray(serverList)) {
        setAllServerBookings(serverList);

        // Also cross-verify myBookings with server list:
        // if an admin removed a booking on the server, remove it locally
        setMyBookings((prev) =>
          prev.filter((myB) => serverList.some((sB: Booking) => sB.id === myB.id))
        );
      }
    };

    const handleReviewsUpdate = (e: any) => {
      const serverReviews = e.detail || [];
      if (Array.isArray(serverReviews)) {
        setCustomReviews(serverReviews);
      }
    };

    window.addEventListener('meo_bookings_updated', handleBookingsUpdate);
    window.addEventListener('meo_reviews_updated', handleReviewsUpdate);

    return () => {
      cleanup?.();
      window.removeEventListener('meo_bookings_updated', handleBookingsUpdate);
      window.removeEventListener('meo_reviews_updated', handleReviewsUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_BOOKINGS, JSON.stringify(myBookings));
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  }, [myBookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_REVIEWS, JSON.stringify(customReviews));
    } catch (e) {
      console.error('Failed to save reviews to localStorage', e);
    }
  }, [customReviews]);

  const handleOpenBooking = (serviceId?: string, additionalIds?: string[]) => {
    setPreselectedServiceId(serviceId);
    setPreselectedAdditionalIds(additionalIds);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setMyBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
    setAllServerBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setMyBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setAllServerBookings((prev) => prev.filter((b) => b.id !== bookingId));
    cancelBookingOnServer(bookingId);
  };

  const handleAddReview = (newReview: Review) => {
    setCustomReviews((prev) => [newReview, ...prev]);
    createReviewOnServer(newReview);
  };

  const handleExplorePortfolio = () => {
    const el = document.getElementById('portfolio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 w-full overflow-x-hidden max-w-full ${
        isDark
          ? 'bg-[#150F11] text-[#F7F1F2] selection:bg-[#C57280] selection:text-white'
          : 'bg-[#FBF9FA] text-[#1A1014] selection:bg-[#B83E58] selection:text-white'
      }`}
    >
      {/* Liquid Glass Ambient Backdrops */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C57280]/10 blur-3xl animate-liquid-float" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full bg-[#B83E58]/10 blur-3xl animate-liquid-pulse-glow" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-[#E8A5B2]/10 blur-3xl animate-liquid-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Top Header */}
      <Header
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        bookingsCount={myBookings.length}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-grow relative z-1">
        {/* 1. Hero Showcase */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onExplorePortfolio={handleExplorePortfolio}
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        />

        {/* 2. Services & Pricing with direct booking links */}
        <ServicesSection
          onSelectServiceForBooking={(serviceId, additionalServiceIds) =>
            handleOpenBooking(serviceId, additionalServiceIds)
          }
        />

        {/* 3. News, Articles & Beauty Blog */}
        <NewsSection onOpenBooking={(serviceId) => handleOpenBooking(serviceId)} />

        {/* 4. Portfolio with Before/After Slider & Gallery */}
        <PortfolioSection
          onSelectServiceForBooking={(serviceId) => handleOpenBooking(serviceId)}
        />

        {/* 5. Real Yandex Reviews & User Feedback Submission */}
        <ReviewsSection
          onOpenNewReviewModal={() => setIsNewReviewOpen(true)}
          customReviews={customReviews}
        />

        {/* 6. About Salon, Standards, Amenities & Masters */}
        <AboutSection onOpenBooking={() => handleOpenBooking()} />

        {/* 7. Contacts & Fast Communication Channels */}
        <ContactsSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* Floating Action Bars (Mobile & Desktop) */}
      <FloatingActions
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        bookingsCount={myBookings.length}
      />

      {/* Interactive Booking Wizard Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setPreselectedServiceId(undefined);
          setPreselectedAdditionalIds(undefined);
        }}
        preselectedServiceId={preselectedServiceId}
        preselectedAdditionalIds={preselectedAdditionalIds}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* My Bookings Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={myBookings}
        onCancelBooking={handleCancelBooking}
        onOpenBooking={() => {
          setIsMyBookingsOpen(false);
          setIsBookingOpen(true);
        }}
      />

      {/* New Review Modal */}
      <NewReviewModal
        isOpen={isNewReviewOpen}
        onClose={() => setIsNewReviewOpen(false)}
        onSubmitReview={handleAddReview}
      />

      {/* Secret Admin Authentication (Password: 1234) */}
      <AdminLoginModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminAuthOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Full Admin Management Panel - displays ALL client bookings in real-time */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        bookings={allServerBookings}
      />
    </div>
  );
}
