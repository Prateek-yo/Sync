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

  // Check authentication
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/user/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
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

  //  Token setup & auth check
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
