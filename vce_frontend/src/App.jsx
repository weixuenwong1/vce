import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, matchPath, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


// heavy 
const Summaries = lazy(() => import('./pages/Summaries'))         
const Problems = lazy(() => import('./pages/Problems'))
const SAC = lazy(() => import('./pages/SAC'))

// medium / general
const Practice = lazy(() => import('./pages/Practice'))
const Chapters = lazy(() => import('./pages/Chapters'))
const PracticeSAC = lazy(() => import('./pages/PracticeSAC'))
const SubmitQuestion = lazy(() => import('./pages/SubmitQuestion'))

// light 
const Home = lazy(() => import('./pages/Home'))
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const PasswordResetRequest = lazy(() => import('./pages/PasswordResetRequest'))
const PasswordReset = lazy(() => import('./pages/PasswordReset'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const HowToUseChuba = lazy(() => import('./pages/UsingChuba'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Fallback = lazy(() => import('./pages/Fallback'))

export default function App() {
  const location = useLocation()
  const path = location.pathname

  const noNavbar = [
    '/login',
    '/register',
    '/request/password_reset',
    '/password-reset/:token'
  ].some(pattern => matchPath({ path: pattern, end: true }, path))

  const noFooter = [
    '/login',
    '/register',
    '/request/password_reset',
    '/password-reset/:token',
    '/practice-sac/:subject/:chapter_slug',
    '/practice/:subject/:chapter_slug/:topic_slug',
    '/summaries/:subject/:chapter_slug/:topic_slug'
  ].some(pattern => matchPath({ path: pattern, end: true }, path))

  return (
    <div className="app-shell">
      <ScrollToTop />
      {!noNavbar && <Navbar />}

      <main className="page-main" id="content">
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        <Suspense fallback={<div className="route-skeleton" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/request/password_reset" element={<PasswordResetRequest />} />
            <Route path="/password-reset/:token" element={<PasswordReset />} />

            <Route path="/summaries/:subject" element={<Chapters />} />
            <Route path="/practice/:subject" element={<Practice />} />
            <Route path="/practice-sac/:subject" element={<PracticeSAC />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/how-to-use-chuba" element={<HowToUseChuba />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/500" element={<Fallback />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/summaries/:subject/:chapter_slug/:topic_slug" element={<Summaries />} />
              <Route path="/practice/:subject/:chapter_slug/:topic_slug" element={<Problems />} />
              <Route path="/practice-sac/:subject/:chapter_slug" element={<SAC />} />
              <Route path="/submit-question" element={<SubmitQuestion />} />
            </Route>

            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!noFooter && <Footer />}
    </div>
  );
}
