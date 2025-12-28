// import { Children, createContext, useEffect, useState } from "react";
// import axios from 'axios'
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";


// const backendUrl=import.meta.env.VITE_BACKEND_URL
// axios.defaults.baseURL=backendUrl;

// export const AuthContext=createContext();

// export const AuthProvider=({Children})=>{
//     const[token,setToken]=useState(localStorage.getItem("token"));
//     const [authUser,setAuthUser]=useState(null)
//     const[onlineUsers,setOnlineUsers]=useState([])
//     const[socket,setSocket]=useState(null)
// //check if authenticated
// const checkAuth = async () => {
//     try {
//         const { data } = await axios.get("/api/auth/check");
//         if (data.success) {
//             setAuthUser(data.user);
//         }
//     } catch (error) {
//             toast.error(error.message)
//     }
// };
// //connect sokcet function to handle
// const connectSocket=(userData)=>{
//     if(!userData || socket.conected) return;
//     const newSocket=io(backendUrl,{
//         query:{
//             userId:userData._id,
//         }
//     })
//     newSocket.connect()
//     setSocket(newSocket)
//     newSocket.on("getOnlineUsers",()=>{
//         setOnlineUsers(userIds);
//     })
// }
// useEffect(()=>{
//     if(token){
//         axios.defaults.headers.common["token"]=token;
//     }
//     checkAuth()
// },[])

//     const value={
//             axios,
//             authUser,
//             onlineUsers,
//             socket

//     }
//     return (
//         <AuthContext.Provider value={value}>
//             {Children}
//         </AuthContext.Provider>
//     )
// }

import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Start as true

  // Check authentication
  const checkAuth = async () => {
    console.log('[AuthContext] checkAuth called')
    try {
      // Check if token exists
      const token = localStorage.getItem("token");
      console.log('[AuthContext] Token exists:', !!token)

      if (!token) {
        console.log('[AuthContext] No token found, setting authUser to null')
        setAuthUser(null);
        setIsAuthLoading(false);
        return;
      }

      console.log('[AuthContext] Calling /api/user/check')
      const { data } = await axios.get("/api/user/check");
      console.log('[AuthContext] API response:', data)

      if (data.success) {
        console.log('[AuthContext] Auth successful, user:', data.user.fullName)
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        // Clear auth state if check fails
        console.log('[AuthContext] Auth check failed, clearing auth state')
        setAuthUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        delete axios.defaults.headers.common["token"];
      }
    } catch (error) {
      console.error("[AuthContext] Auth check error:", error.message);
      // Handle token expiry or unauthorized access - AGGRESSIVELY CLEAR
      console.log('[AuthContext] Clearing all auth data due to error')
      setAuthUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      delete axios.defaults.headers.common["token"];
    } finally {
      console.log('[AuthContext] Setting isAuthLoading to false')
      setIsAuthLoading(false);
    }
  };

  //  Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  //  Token setup & auth check - Run once on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.defaults.headers.common["token"] = storedToken;
      setToken(storedToken);
      checkAuth();
    } else {
      setIsAuthLoading(false);
    }
  }, []); // Only run on mount

  // Logout function
  const logout = () => {
    setAuthUser(null);
    setToken(null);
    setSocket(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    delete axios.defaults.headers.common["token"];
  };

  const value = {
    axios,
    authUser,
    setAuthUser,
    token,
    setToken,
    onlineUsers,
    socket,
    isAuthLoading,
    logout,
    checkAuth, // Expose checkAuth for manual re-check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
