import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { logoutUser } from '../lib/utilis'
import toast from 'react-hot-toast'
import ProfessionalAvatar from './ProfessionalAvatar'

const RightSidebar = ({ selectedUser, messages }) => {
  const navigate = useNavigate()

  // Extract images from messages
  const conversationImages = useMemo(() => {
    if (!messages || messages.length === 0) return []
    return messages
      .filter(msg => msg.image)
      .map(msg => msg.image)
  }, [messages])

  const handleLogout = async () => {
    try {
      await logoutUser()
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  return selectedUser ? (
    <div className={`w-[35%] md:w-[330px] h-full p-5 overflow-y-scroll text-white border-l border-white/10 ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Profile Info */}
      <div className='flex flex-col items-center gap-3 pb-6 border-b border-white/10'>
        {selectedUser?.avatar && selectedUser.avatar.name ? (
          <ProfessionalAvatar
            avatarData={selectedUser.avatar}
            size={80}
            fallbackName={selectedUser.fullName}
          />
        ) : selectedUser?.profilePic ? (
          <img
            src={selectedUser.profilePic}
            alt={selectedUser.fullName}
            className='w-20 h-20 rounded-full object-cover border-4 border-violet-500/30'
          />
        ) : (
          <div className='w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl font-semibold text-white border-4 border-violet-500/30'>
            {selectedUser?.fullName?.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className='text-xl font-semibold'>{selectedUser.fullName}</h2>
        <p className='text-slate-400 text-sm'>View Profile</p>
      </div>

      {/* Media Gallery */}
      <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-4'>Media</h3>
        {conversationImages.length > 0 ? (
          <div className='grid grid-cols-3 gap-2'>
            {conversationImages.map((imageUrl, index) => (
              <div key={index} className='glass rounded-lg overflow-hidden hover-lift cursor-pointer'>
                <img
                  src={imageUrl}
                  alt={`media-${index}`}
                  className='w-full h-20 object-cover'
                />
              </div>
            ))}
          </div>
        ) : (
          <p className='text-slate-400 text-sm'>No media shared yet</p>
        )}
      </div>


      {/* Logout Button */}
      <div className='mt-8'>
        <button
          onClick={handleLogout}
          className='modern-button w-full hover-glow'
        >
          Logout
        </button>
      </div>
    </div>
  ) : null
}

export default RightSidebar
