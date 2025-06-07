import { useState, createContext } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Practice from './components/Practice'
import Chapters from './components/Chapters'
import Problems from './components/Problems'
import Summaries from './components/Summaries'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'
import { Routes, Route, useLocation } from 'react-router-dom'


function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/register" || location.pathname === "/login" ||location.pathname.includes('password')
  
  return (
    <>
      {noNavbar ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />
        </Routes>
      ) : (
        <div className = 'pages' >
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chapters/:subject" element={<Chapters />} />
              <Route path="/summaries/:subject/:chapter_slug/:topic_slug" element={<Summaries />} />
              <Route path="/practice/:subject" element={<Practice />} />
              <Route path="/practice/:subject/:chapter_slug/:topic_slug" element={<Problems />} />
            </Routes>
            
          </div>
      )}
    </>
  );
}

export default App
