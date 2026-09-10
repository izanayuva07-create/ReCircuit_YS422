import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollManager from './components/ScrollManager';
import CollectorLayout from './layouts/CollectorLayout';
import PublicLayout from './layouts/PublicLayout';
import RecyclerLayout from './layouts/RecyclerLayout';
import SourceLayout from './layouts/SourceLayout';
import AIChatbotWidget from './components/AIChatbotWidget';
import { LanguageProvider } from './context/LanguageContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SelectRolePage = lazy(() => import('./pages/auth/SelectRolePage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const CollectorDashboardPage = lazy(() => import('./pages/collector/CollectorDashboardPage'));
const CollectorHistoryPage = lazy(() => import('./pages/collector/CollectorHistoryPage'));
const CollectorInventoryPage = lazy(() => import('./pages/collector/CollectorInventoryPage'));
const CollectorJobDetailPage = lazy(() => import('./pages/collector/CollectorJobDetailPage'));
const CollectorJobsPage = lazy(() => import('./pages/collector/CollectorJobsPage'));
const CollectorLotDetailPage = lazy(() => import('./pages/collector/CollectorLotDetailPage'));
const CollectorLotsPage = lazy(() => import('./pages/collector/CollectorLotsPage'));
const CollectorPickupPage = lazy(() => import('./pages/collector/CollectorPickupPage'));
const CollectorProfilePage = lazy(() => import('./pages/collector/CollectorProfilePage'));
const CollectorScanPage = lazy(() => import('./pages/collector/CollectorScanPage'));
const CreateLotPage = lazy(() => import('./pages/collector/CreateLotPage'));
const AwarenessPage = lazy(() => import('./pages/public/AwarenessPage'));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'));
const SafetyPage = lazy(() => import('./pages/public/SafetyPage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const NewsArticlePage = lazy(() => import('./pages/public/NewsArticlePage'));
const RecyclerDashboardPage = lazy(() => import('./pages/recycler/RecyclerDashboardPage'));
const RecyclerHistoryPage = lazy(() => import('./pages/recycler/RecyclerHistoryPage'));
const RecyclerLotDetailPage = lazy(() => import('./pages/recycler/RecyclerLotDetailPage'));
const RecyclerLotsPage = lazy(() => import('./pages/recycler/RecyclerLotsPage'));
const RecyclerProfilePage = lazy(() => import('./pages/recycler/RecyclerProfilePage'));
const RecyclerRequestsPage = lazy(() => import('./pages/recycler/RecyclerRequestsPage'));
const BookingDetailPage = lazy(() => import('./pages/source/BookingDetailPage'));
const BookingsPage = lazy(() => import('./pages/source/BookingsPage'));
const HistoryPage = lazy(() => import('./pages/source/HistoryPage'));
const ListingDetailPage = lazy(() => import('./pages/source/ListingDetailPage'));
const ProfilePage = lazy(() => import('./pages/source/ProfilePage'));
const SellWastePage = lazy(() => import('./pages/source/SellWastePage'));
const SourceDashboardPage = lazy(() => import('./pages/source/SourceDashboardPage'));
const SourceCertificatesPage = lazy(() => import('./pages/source/SourceCertificatesPage'));
const GamificationPage = lazy(() => import('./pages/source/GamificationPage'));

const App: React.FC = () => (
  <LanguageProvider>
    <ScrollManager />
    <Suspense fallback={<Loader fullPage message="Loading Re-Circuit…" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="awareness" element={<AwarenessPage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsArticlePage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="select-role" element={<SelectRolePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route element={<ProtectedRoute role="source" />}>
          <Route path="source" element={<SourceLayout />}>
            <Route index element={<SourceDashboardPage />} />
            <Route path="sell" element={<SellWastePage />} />
            <Route path="listing/:id" element={<ListingDetailPage />} />
            <Route path="listings/:id" element={<ListingDetailPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="booking/:id" element={<BookingDetailPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="certificates" element={<SourceCertificatesPage />} />
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/source" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="collector" />}>
          <Route path="collector" element={<CollectorLayout />}>
            <Route index element={<CollectorDashboardPage />} />
            <Route path="jobs" element={<CollectorJobsPage />} />
            <Route path="jobs/:id" element={<CollectorJobDetailPage />} />
            <Route path="job/:id" element={<CollectorJobDetailPage />} />
            <Route path="pickups/:id" element={<CollectorPickupPage />} />
            <Route path="scan" element={<CollectorScanPage />} />
            <Route path="inventory" element={<CollectorInventoryPage />} />
            <Route path="lots" element={<CollectorLotsPage />} />
            <Route path="lots/new" element={<CreateLotPage />} />
            <Route path="lots/:id" element={<CollectorLotDetailPage />} />
            <Route path="history" element={<CollectorHistoryPage />} />
            <Route path="profile" element={<CollectorProfilePage />} />
            <Route path="*" element={<Navigate to="/collector" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="recycler" />}>
          <Route path="recycler" element={<RecyclerLayout />}>
            <Route index element={<RecyclerDashboardPage />} />
            <Route path="lots" element={<RecyclerLotsPage />} />
            <Route path="lots/:id" element={<RecyclerLotDetailPage />} />
            <Route path="requests" element={<RecyclerRequestsPage />} />
            <Route path="history" element={<RecyclerHistoryPage />} />
            <Route path="profile" element={<RecyclerProfilePage />} />
            <Route path="*" element={<Navigate to="/recycler" replace />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <AIChatbotWidget />
    </Suspense>
  </LanguageProvider>
);

export default App;
