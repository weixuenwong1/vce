import { useState, createContext } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Practice from './components/Practice'
import Chapters from './components/Chapters'
import { Routes, Route, useLocation } from 'react-router-dom'


function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/register" || location.pathname === "/login"
  
  return (
    <>
      {noNavbar ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        <div className = 'pages' >
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chapters" element={<Chapters />} />
              <Route path="/practice" element={<Practice />} />
            </Routes>
            
          </div>
      )}
    </>
  );
}

export default App
