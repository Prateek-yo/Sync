import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const { user } = useContext(AuthContext)

  return (
    <div className="bg-[url(./src/assets/bgImage.svg)] bg-contain bg-no-repeat min-h-screen">
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
