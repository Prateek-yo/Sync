import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { logoutUser, deleteAccount } from '../lib/utilis'
import toast from 'react-hot-toast'

const SideBar = ({ selectedUser, setSelectedUser, users, onlineUsers, unseenMessages }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = users?.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        // Load current user from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await deleteAccount();
            if (response.success) {
                // Clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                toast.success('Account deleted successfully');
                navigate('/login');
            } else {
                toast.error(response.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            toast.error('Failed to delete account');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!currentUser?.fullName) return 'U';
        return currentUser.fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <div
                className={`w-[300px] md:w-[330px] max-md:w-full h-full p-5 overflow-y-scroll text-white 
                border-r border-white/10 ${selectedUser ? "max-md:hidden" : ""}`}
            >
                {/* Header */}
                <div className='pb-5'>
                    <div className='flex justify-between items-center'>
                        <img src={assets.logo} alt="App Logo" className='max-w-40' />

                        <div className="relative py-2">
                            {/* Profile Avatar/Icon */}
                            <div onClick={() => setShowDropdown(!showDropdown)}>
                                {currentUser?.profilePic ? (
                                    <img
                                        src={currentUser.profilePic}
                                        alt="Profile"
                                        className='w-9 h-9 rounded-full cursor-pointer object-cover border-2 border-violet-500'
                                    />
                                ) : (
                                    <div className='w-9 h-9 rounded-full cursor-pointer bg-gradient-to-r from-purple-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-violet-500'>
                                        {getUserInitials()}
                                    </div>
                                )}
                            </div>

                            <div className={`absolute top-full right-0 z-20 w-48 p-4 rounded-xl glass-strong fade-in ${showDropdown ? 'block' : 'hidden'}`}>
                                {/* User Info */}
                                {currentUser && (
                                    <div className='mb-3 pb-3 border-b border-white/10'>
                                        <p className='font-medium text-sm truncate text-white'>{currentUser.fullName}</p>
                                        <p className='text-xs text-slate-400 truncate'>{currentUser.email}</p>
                                    </div>
                                )}

                                <p
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowDropdown(false);
                                    }}
                                    className='cursor-pointer text-sm py-2 px-2 hover:bg-violet-500/20 rounded-lg transition-colors'
                                >
                                    Update Profile
                                </p>

                                <p
                                    onClick={() => {
                                        setShowDropdown(false);
                                        handleLogout();
                                    }}
                                    className='cursor-pointer text-sm py-2 px-2 hover:bg-violet-500/20 rounded-lg transition-colors'
                                >
                                    Logout
                                </p>

                                <hr className="my-2 border-t border-white/10" />

                                <p
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setShowDeleteModal(true);
                                    }}
                                    className='cursor-pointer text-sm py-2 px-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400'
                                >
                                    Delete Account
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className='glass rounded-full flex items-center gap-2 py-3 px-4 mt-5 hover-glow'>
                        <img src={assets.search_icon} alt="Search Icon" className='w-3 opacity-70' />

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='bg-transparent border-none outline-none text-white text-xs placeholder-slate-400 flex-1'
                            placeholder='Search User...'
                        />
                    </div>
                </div>

                {/* USER LIST */}
                <div className='flex flex-col'>
                    {filteredUsers?.length > 0 ? (
                        filteredUsers.map((user) => {
                            const isOnline = onlineUsers?.includes(user._id)
                            const unreadCount = unseenMessages[user._id]

                            return (
                                <div
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`
                                        relative flex items-center gap-3 
                                        p-3 rounded-xl cursor-pointer max-sm:text-sm hover-lift mb-2
                                        transition-all duration-300
                                        ${selectedUser?._id === user._id ? 'glass' : ''}
                                    `}
                                >
                                    <div className='relative'>
                                        <img
                                            src={user?.profilePic || assets.avatar_icon}
                                            alt={`${user.fullName}'s profile`}
                                            className='w-12 h-12 rounded-full object-cover'
                                        />
                                        {/* Online indicator */}
                                        {isOnline && (
                                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full pulse-dot border-2 border-gray-900' />
                                        )}
                                    </div>

                                    <div className='flex-1 flex flex-col leading-5'>
                                        <p className="truncate w-[150px] font-medium">{user.fullName}</p>
                                        <span className='text-slate-400 text-xs'>
                                            {isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>

                                    {/* Unread badge */}
                                    {unreadCount > 0 && (
                                        <div className='badge-gradient px-2 py-1 text-xs font-semibold min-w-[20px] text-center'>
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-gray-400 text-sm">No users found</p>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in'>
                    <div className='glass-strong rounded-2xl p-6 max-w-md w-full mx-4'>
                        <h3 className='text-white text-xl font-semibold mb-4'>Delete Account</h3>
                        <p className='text-slate-300 mb-6'>
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                        </p>
                        <div className='flex gap-3 justify-end'>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className='px-4 py-2 glass text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className='px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50'
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SideBar