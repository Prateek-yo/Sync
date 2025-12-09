import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { updateProfile } from '../lib/utilis'
import toast from 'react-hot-toast'

const ProfilePage = () => {

    const [selectedImg, setSelectedImg] = useState(null)
    const navigate = useNavigate();
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Load user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            setName(user.fullName || "");
            setBio(user.bio || "");
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
                navigate('/');
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
            <div className='glass-strong w-full max-w-2xl p-8 rounded-3xl shadow-2xl fade-in'>

                <div className='flex justify-between items-center mb-8 border-b border-white/10 pb-4'>
                    <h2 className='text-3xl font-semibold text-white'>Edit Profile</h2>
                    <button
                        onClick={() => navigate('/')}
                        className='p-2 hover:bg-white/10 rounded-full transition-all text-white'
                    >
                        ✕
                    </button>
                </div>

                <div className='flex flex-col md:flex-row gap-10'>
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">

                        <div className='flex flex-col items-center gap-4 md:hidden'>
                            <div className='relative group'>
                                <img
                                    src={selectedImg || assets.avatar_icon}
                                    alt="Profile"
                                    className='w-24 h-24 rounded-full object-cover border-4 border-violet-500/50 shadow-lg'
                                />
                                <label
                                    htmlFor="avatar-mobile"
                                    className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity'
                                >
                                    <img src={assets.upload_icon || assets.pen_icon || assets.gallery_icon} alt="upload" className='w-6 opacity-80 filter invert' />
                                </label>
                                <input
                                    onChange={handleImageChange}
                                    type="file"
                                    id='avatar-mobile'
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                />
                            </div>
                            <p className='text-sm text-slate-300'>Tap to change photo</p>
                        </div>

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

                    {/* Desktop Image Section */}
                    <div className='hidden md:flex flex-col items-center gap-6 min-w-[200px] border-l border-white/10 pl-10 justify-center'>
                        <div className='relative group'>
                            <img
                                src={selectedImg || assets.avatar_icon}
                                alt="Profile"
                                className='w-40 h-40 rounded-full object-cover border-4 border-violet-500/50 shadow-2xl'
                            />
                            <label
                                htmlFor="avatar-desktop"
                                className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm'
                            >
                                <span className='text-white font-medium'>Change Photo</span>
                            </label>
                            <input
                                onChange={handleImageChange}
                                type="file"
                                id='avatar-desktop'
                                accept='.png, .jpg, .jpeg'
                                hidden
                            />
                        </div>
                        <p className='text-center text-slate-400 text-sm'>
                            Upload a new avatar.<br />Larger images will be resized.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProfilePage
