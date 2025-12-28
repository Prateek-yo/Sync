import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'

// Root redirect component
const RootRedirect = () => {
  const { authUser, isAuthLoading } = useContext(AuthContext)

  console.log('[RootRedirect] isAuthLoading:', isAuthLoading, 'authUser:', authUser)

  // Show loading while checking auth
  if (isAuthLoading) {
    console.log('[RootRedirect] Still loading auth...')
    return (
      <div className='gradient-main min-h-screen flex items-center justify-center'>
        <div className='glass-strong p-8 rounded-3xl flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-white text-lg'>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect based on auth status - STRICT CHECK
  const token = localStorage.getItem("token")
  console.log('[RootRedirect] token exists:', !!token, 'authUser exists:', !!authUser)

  // Only redirect to chat if BOTH authUser and token exist
  if (authUser && token) {
    console.log('[RootRedirect] Redirecting to /chat')
    return <Navigate to='/chat' replace />
  }

  // Default to login (security first)
  console.log('[RootRedirect] Redirecting to /login')
  return <Navigate to='/login' replace />
}

const App = () => {
  return (
    <div className="gradient-main min-h-screen">
      <Toaster />
      <Routes>
        {/* Root route - redirect based on auth */}
        <Route path='/' element={<RootRedirect />} />

        {/* Login route */}
        <Route path='/login' element={<LoginPage />} />

        {/* Protected chat route */}
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Protected profile route */}
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes to root (which will then redirect appropriately) */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  )
}

export default App
