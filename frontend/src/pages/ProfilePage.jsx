import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { updateProfile, updateAvatar } from '../lib/utilis'
import AvatarSelector from '../components/AvatarSelector'
import ProfessionalAvatar from '../components/ProfessionalAvatar'
import toast from 'react-hot-toast'

const ProfilePage = () => {
    const [selectedImg, setSelectedImg] = useState(null)
    const navigate = useNavigate();
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [avatar, setAvatar] = useState("")
    const [loading, setLoading] = useState(false)
    const [showAvatarSelector, setShowAvatarSelector] = useState(false)

    useEffect(() => {
        // Load user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            setName(user.fullName || "");
            setBio(user.bio || "");
            setAvatar(user.avatar || "");
            if (user.profilePic) setSelectedImg(user.profilePic);
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImg(reader.result); // base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSelect = async (newAvatar) => {
        setAvatar(newAvatar);
        setShowAvatarSelector(false);

        // Save avatar immediately
        try {
            const data = await updateAvatar(newAvatar);
            if (data.success) {
                toast.success('Avatar updated!');
                // Update localStorage
                const userData = JSON.parse(localStorage.getItem('userData'));
                userData.avatar = newAvatar;
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                toast.error(data.message || 'Failed to update avatar');
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error('Failed to update avatar');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const profileData = {
                fullName: name,
                bio: bio,
                ...(selectedImg && { profilePic: selectedImg })
            };

            const data = await updateProfile(profileData);

            if (data.success) {
                toast.success('Profile updated successfully');
                // Update localStorage with new user data
                localStorage.setItem('userData', JSON.stringify(data.user));
                navigate('/chat');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='gradient-main min-h-screen flex items-center justify-center p-4'>
            <div className='glass-strong w-full max-w-4xl p-8 rounded-3xl shadow-2xl fade-in'>

                {/* Header */}
                <div className='flex justify-between items-center mb-8 pb-6 border-b border-white/10'>
                    <h2 className='text-3xl font-semibold text-white'>Edit Profile</h2>
                    <button
                        onClick={() => navigate('/chat')}
                        className='w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-white text-2xl'
                    >
                        ✕
                    </button>
                </div>

                {/* Avatar Section - Prominent */}
                <div className='mb-8 flex flex-col items-center gap-4 pb-6 border-b border-white/10'>
                    <div className='relative group'>
                        {avatar && avatar.name ? (
                            <ProfessionalAvatar
                                avatarData={avatar}
                                size={128}
                                fallbackName={name}
                            />
                        ) : selectedImg ? (
                            <img
                                src={selectedImg}
                                alt="Profile"
                                className='w-32 h-32 rounded-full object-cover border-4 border-blue-500/50 shadow-2xl'
                            />
                        ) : (
                            <div className='w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white/20'>
                                {name.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    <div className='flex gap-3'>
                        <button
                            type="button"
                            onClick={() => setShowAvatarSelector(true)}
                            className='modern-button px-6 py-2.5 text-sm'
                        >
                            Choose Professional Avatar
                        </button>
                        <label className='glass px-6 py-2.5 rounded-xl text-white text-sm font-medium cursor-pointer hover:bg-white/10 transition-all'>
                            <input
                                onChange={handleImageChange}
                                type="file"
                                accept='.png, .jpg, .jpeg'
                                hidden
                            />
                            Upload Photo
                        </label>
                    </div>
                </div>

                {/* Avatar Selector Modal */}
                {showAvatarSelector && (
                    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in'>
                        <div className='glass-strong rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
                            <div className='flex justify-between items-center mb-6'>
                                <h3 className='text-2xl font-semibold text-white'>Choose Your Avatar</h3>
                                <button
                                    onClick={() => setShowAvatarSelector(false)}
                                    className='w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-white text-2xl'
                                >
                                    ✕
                                </button>
                            </div>
                            <AvatarSelector onSelect={handleAvatarSelect} currentAvatar={avatar} />
                        </div>
                    </div>
                )}

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-slate-300 ml-1'>Full Name</label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            type="text"
                            required
                            placeholder='Your name'
                            className='modern-input'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-slate-300 ml-1'>Bio</label>
                        <textarea
                            onChange={(e) => setBio(e.target.value)}
                            value={bio}
                            placeholder='Write a short bio...'
                            required
                            className='modern-input resize-none'
                            rows={4}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="modern-button w-full py-3 mt-4 text-base font-semibold"
                    >
                        {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage
