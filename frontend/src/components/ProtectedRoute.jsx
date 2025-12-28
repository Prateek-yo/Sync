import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const ProtectedRoute = ({ children }) => {
    const { authUser, isAuthLoading } = useContext(AuthContext)

    // Show loading state while checking authentication
    if (isAuthLoading) {
        return (
            <div className='gradient-main min-h-screen flex items-center justify-center'>
                <div className='glass-strong p-8 rounded-3xl flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin'></div>
                    <p className='text-white text-lg'>Loading...</p>
                </div>
            </div>
        )
    }

    // Check both authUser and token in localStorage
    const token = localStorage.getItem("token");
    if (!authUser || !token) {
        return <Navigate to='/login' replace />
    }

    // Render protected content if authenticated
    return children
}

export default ProtectedRoute
