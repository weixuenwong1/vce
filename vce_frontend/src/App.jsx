import { useState, createContext } from 'react'
import './App.css'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Practice from './pages/Practice'
import Chapters from './pages/Chapters'
import Problems from './pages/Problems'
import Summaries from './pages/Summaries'
import PasswordResetRequest from './pages/PasswordResetRequest'
import PasswordReset from './pages/PasswordReset'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import PracticeSAC from './pages/PracticeSAC'
import SAC from './pages/SAC'
import HowToUseChuba from './pages/UsingChuba'
import Logo from './components/Logo'
import NotFound from './pages/NotFound'
import { Routes, Route, useLocation, matchPath, Navigate } from 'react-router-dom'


function App() {
  const location = useLocation()
  const path = location.pathname;
  
  const onlyLogoRoutes = [
    '/login',
    '/register',
  ];

  const onlyLogo = onlyLogoRoutes.some(pattern =>
    matchPath({ path: pattern, end: true }, path)
  );

  const noNavbar = [
    '/login',
    '/register',
    '/request/password_reset',
    '/password-reset/:token'
  ].some(pattern =>
    matchPath({ path: pattern, end: true }, path)
  );

  const noFooter = [
    '/login',
    '/register',
    '/request/password_reset',
    '/password-reset/:token',
    '/practice-sac/:subject/:chapter_slug',
    '/practice/:subject/:chapter_slug/:topic_slug',
    '/summaries/:subject/:chapter_slug/:topic_slug'
  ].some(pattern =>
    matchPath({ path: pattern, end: true }, path)
  );
  
  return (
    <>
      {onlyLogo ? <Logo /> : (!noNavbar && <Navbar />)}
      <div className="pages">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />

          <Route path="/" element={<Home />} />
          <Route path="/summaries/:subject" element={<Chapters />} />
          <Route path="/summaries/:subject/:chapter_slug/:topic_slug" element={<Summaries />} />
          <Route path="/practice/:subject" element={<Practice />} />
          <Route path="/practice/:subject/:chapter_slug/:topic_slug" element={<Problems />} />
          <Route path="/practice-sac/:subject" element={<PracticeSAC />} />
          <Route path="/practice-sac/:subject/:chapter_slug" element={<SAC />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/how-to-use-chuba" element={<HowToUseChuba />} />
          <Route path="/404" element={<NotFound />} />

          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
      {!noFooter && <Footer />}
    </>
  );
}

export default App
