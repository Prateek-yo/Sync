import React, { useState, useEffect, useContext } from 'react'
import assets from '../assets/assets'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {

  const navigate = useNavigate()
  const { axios, authUser, isAuthLoading, setToken, checkAuth } = useContext(AuthContext)
  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is already authenticated, redirect to chat
  useEffect(() => {
    if (!isAuthLoading && authUser) {
      navigate('/chat', { replace: true });
    }
  }, [authUser, isAuthLoading, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === 'Sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }

    setLoading(true);

    try {
      const endpoint = currState === 'Sign up' ? '/signup' : '/login';
      const payload = currState === 'Sign up'
        ? { fullName, email, password, bio }
        : { email, password };

      const response = await axios.post(`/api/user${endpoint}`, payload);

      const data = response.data;

      if (data.success) {
        toast.success(data.message);
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        // Update AuthContext token state
        setToken(data.token);
        // Set axios header immediately
        axios.defaults.headers.common['token'] = data.token;
        // Manually trigger auth check
        await checkAuth();
        // Navigation will happen automatically via useEffect when authUser is set
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='gradient-main min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
        {/* Left side - Logo and branding */}
        <div className='flex flex-col items-center gap-6 text-white fade-in'>
          <img
            src={assets.logo_big}
            alt="Logo"
            className='w-[min(40vw,300px)] drop-shadow-2xl hover-scale'
          />
          <h1 className='text-5xl font-bold text-center text-gradient'>Welcome Back</h1>
          <p className='text-slate-300 text-center max-w-md text-lg'>
            Connect with friends and family through seamless, real-time messaging with our modern platform
          </p>
        </div>

        {/* Right side - Login/Signup form */}
        <form
          onSubmit={onSubmitHandler}
          className='glass-strong p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto fade-in'
        >
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-semibold text-3xl text-white'>
              {currState}
            </h2>
            {isDataSubmitted && (
              <button
                type="button"
                onClick={() => setIsDataSubmitted(false)}
                className='p-2 hover:bg-white/10 rounded-full transition-all'
              >
                <img
                  src={assets.arrow_icon}
                  alt="back"
                  className='w-5'
                />
              </button>
            )}
          </div>

          <div className='flex flex-col gap-4'>
            {currState === "Sign up" && !isDataSubmitted && (
              <input
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                type="text"
                className='modern-input'
                placeholder="Full Name"
                required
              />
            )}

            {!isDataSubmitted && (
              <>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  placeholder="Email Address"
                  required
                  className='modern-input'
                />

                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  placeholder="Password"
                  required
                  className='modern-input'
                />
              </>
            )}

            {currState === "Sign up" && isDataSubmitted && (
              <textarea
                onChange={(e) => setBio(e.target.value)}
                value={bio}
                rows={4}
                className='modern-input resize-none'
                placeholder='Tell us about yourself...'
                required
              ></textarea>
            )}

            <button
              type='submit'
              disabled={loading}
              className='modern-button w-full py-3 text-base font-semibold mt-2'
            >
              {loading ? 'Please wait...' : (currState === "Sign up" ? "Create Account" : "Login Now")}
            </button>

            <div className='flex items-center gap-2 text-sm text-slate-300'>
              <input type="checkbox" className='w-4 h-4 accent-blue-500' />
              <p>Agree to the terms of use & privacy policy</p>
            </div>

            <div className='mt-4 text-center'>
              {currState === "Sign up" ? (
                <p className='text-sm text-slate-300'>
                  Already have an account?{' '}
                  <span
                    onClick={() => {
                      setCurrState("Login");
                      setIsDataSubmitted(false)
                    }}
                    className='font-semibold text-violet-400 cursor-pointer hover:text-violet-300 transition-colors'
                  >
                    Login here
                  </span>
                </p>
              ) : (
                <p className='text-sm text-slate-300'>
                  Create an account{' '}
                  <span
                    onClick={() => setCurrState("Sign up")}
                    className='font-semibold text-violet-400 cursor-pointer hover:text-violet-300 transition-colors'
                  >
                    Click here
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
