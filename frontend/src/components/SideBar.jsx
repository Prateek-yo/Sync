import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { logoutUser, deleteAccount, searchUsers } from '../lib/utilis' // Import searchUsers
import toast from 'react-hot-toast'
import ProfessionalAvatar from './ProfessionalAvatar'

const SideBar = ({ selectedUser, setSelectedUser, conversations, setConversations, onlineUsers }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Load current user
        const userData = localStorage.getItem('userData');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    // Debounced Search Handler
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const response = await searchUsers(searchQuery);
                    if (response.success) {
                        setSearchResults(response.users);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleLogout = async () => {
        try {
            await logoutUser();
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

    // Handle selecting a user from search (START NEW CHAT)
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchQuery(""); // Clear search
        setSearchResults([]); // Clear results

        // Check if conversation already exists to avoid duplicates in UI logic if needed
        // but setSelectedUser matches HomePage logic to start chat
    };

    const isOnline = (userId) => onlineUsers?.includes(userId);

    // Determine what to display: Search Results OR Conversations
    const displayList = searchQuery ? searchResults : conversations;

    return (
        <>
            <div className={`w-[300px] md:w-[330px] max-md:w-full h-full p-5 overflow-y-scroll text-white 
                border-r border-white/10 flex flex-col ${selectedUser ? "max-md:hidden" : ""}`}>

                {/* Header */}
                <div className='pb-5 flex-shrink-0'>
                    <div className='flex justify-between items-center mb-4'>
                        <img src={assets.logo} alt="App Logo" className='max-w-32' />

                        <div className="relative">
                            <div onClick={() => setShowDropdown(!showDropdown)} className="cursor-pointer">
                                {currentUser?.avatar && currentUser.avatar.name ? (
                                    <ProfessionalAvatar
                                        avatarData={currentUser.avatar}
                                        size={40}
                                        className='hover-scale ring-2 ring-white/20'
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ring-2 ring-white/20">
                                        {currentUser?.fullName?.[0]}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className='absolute right-0 top-12 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden'>
                                    <div className="p-3 border-b border-white/10">
                                        <p className="font-medium truncate text-white">{currentUser?.fullName}</p>
                                        <p className="text-xs text-gray-400 truncate">Online</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className='w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-2 text-gray-300 hover:text-white'
                                    >
                                        <span>👤</span> Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className='w-full text-left px-4 py-3 hover:bg-white/5 transition-colors text-red-400 hover:text-red-300 flex items-center gap-2'
                                    >
                                        <span>🚪</span> Logout
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className='w-full text-left px-4 py-3 hover:bg-red-500/10 transition-colors text-red-500 text-sm border-t border-white/5'
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className='relative group'>
                        <img src={assets.search_icon} className='absolute top-3 left-4 w-5 opacity-50 group-hover:opacity-100 transition-opacity' alt="search" />
                        <input
                            type="text"
                            placeholder='Search users...'
                            className='w-full p-3 pl-12 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-gray-500 text-white'
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                        />
                    </div>
                </div>

                {/* User List / Search Results */}
                <div className='flex-1 overflow-y-auto space-y-2 custom-scrollbar'>
                    {isSearching ? (
                        <div className="flex justify-center p-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : displayList?.length > 0 ? (
                        <>
                            {searchQuery && <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 px-2">Search Results</p>}

                            {displayList.map((item, index) => {
                                // Unified data structure: item could be user (search) or conversation
                                const user = searchQuery ? item : item; // In search mode item IS the user. In convo mode item has flat user props attached from getConversations
                                const isSelected = selectedUser?._id === user._id;

                                return (
                                    <div
                                        key={user._id || index}
                                        onClick={() => handleSelectUser(user)}
                                        className={`p-3 flex items-center gap-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/5 group
                                            ${isSelected ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 scale-[1.02] shadow-lg shadow-blue-500/10' : 'border border-transparent hover:border-white/10'}
                                        `}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {user.avatar?.name ? (
                                                <ProfessionalAvatar avatarData={user.avatar} size={48} className="transition-transform duration-200 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-lg font-bold transition-transform duration-200 group-hover:scale-110">
                                                    {user.fullName?.[0]}
                                                </div>
                                            )}
                                            {isOnline(user._id) && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#13131f] shadow-sm animate-pulse"></div>
                                            )}
                                        </div>

                                        <div className='flex-1 min-w-0'>
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className="font-bold truncate text-base text-white drop-shadow-md">
                                                    {user.fullName}
                                                </h3>
                                                {!searchQuery && user.lastMessageTime && (
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className='text-sm text-gray-400 truncate group-hover:text-gray-300'>
                                                {searchQuery ? (
                                                    <span className="text-violet-400">Click to start chat</span>
                                                ) : (
                                                    <>
                                                        {user.lastMessage?.senderId === currentUser?._id && 'You: '}
                                                        {user.lastMessage?.text || (user.lastMessage?.image && '📷 Photo') || user.bio || 'Available'}
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {!searchQuery && user.unseenCount > 0 && (
                                            <div className="min-w-5 h-5 px-1.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 scale-in">
                                                <span className="text-[10px] font-bold text-white">{user.unseenCount}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 p-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h3 className="text-xl font-medium mb-1">{searchQuery ? 'No users found' : 'No chats yet'}</h3>
                            <p className="text-sm text-gray-400">
                                {searchQuery ? `We couldn't find anyone matching "${searchQuery}"` : 'Search for a user above to start chatting'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Modal (Keep as is) */}
            {showDeleteModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
                    <div className='bg-[#1a1a2e] p-6 rounded-2xl shadow-xl max-w-sm w-full border border-white/10 transform transition-all scale-100'>
                        <h2 className='text-xl font-bold text-white mb-2'>Delete Account?</h2>
                        <p className='text-gray-400 mb-6'>This action cannot be undone. All your chats and data will be permanently lost.</p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className='flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className='flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-medium transition-all'
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SideBar