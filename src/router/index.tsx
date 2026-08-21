import { Navigate, Route, Routes } from 'react-router-dom'
import SettingsPage from '../pages/admin/SettingsPage'
import FacebookPage from '../pages/admin/FacebookPage'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/Home/HomePage'
import SurprisePage from '../pages/SurprisePage'
import SecureLoginPage from '../pages/admin/SecureLoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import FeaturedPostsPage from '../pages/admin/FeaturedPostsPage'
import SiteSettingsPage from '../pages/admin/SiteSettingsPage'
import ContactLinksPage from '../pages/admin/ContactLinksPage'
import AdBoardPage from '../pages/admin/AdBoardPage'
import AnalyticsPage from '../pages/admin/AnalyticsPage'
import AdminGuard from '../pages/admin/AdminGuard'
import AdminLayout from '../pages/admin/AdminLayout'

function NotFoundPage() {
  return <Navigate to="/#home" replace />
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/admin" element={<SecureLoginPage />} />
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/featured-posts" element={<FeaturedPostsPage />} />
          <Route path="/admin/facebook" element={<FacebookPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/settings/site" element={<SiteSettingsPage />} />
          <Route path="/admin/contact-links" element={<ContactLinksPage />} />
          <Route path="/admin/ads" element={<AdBoardPage />} />
        </Route>
      </Route>
      <Route path="/surprise" element={<SurprisePage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
