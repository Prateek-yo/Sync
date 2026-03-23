import React, { useState, useEffect, useContext } from 'react'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import SideBar from '../components/SideBar.jsx'
import { AuthContext } from '../../context/AuthContext'
import { getConversations } from '../lib/utilis'
import toast from 'react-hot-toast'


const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])

  const { socket, onlineUsers } = useContext(AuthContext)

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await getConversations()
        if (response.success) {
          setConversations(response.conversations || [])
        } else {
          toast.error(response.message || 'Failed to fetch conversations')
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
        toast.error('Failed to load conversations')
      }
    }

    fetchConversations()
  }, [])

  // Listen for socket events to update conversations list in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const currentUserId = JSON.parse(localStorage.getItem('userData'))?._id;
      const otherId = newMessage.senderId === currentUserId ? newMessage.receiverId : newMessage.senderId;

      setConversations(prev => {
        return prev.map(convo => {
          if (convo._id === otherId) {
            return {
              ...convo,
              lastMessage: newMessage,
              lastMessageTime: newMessage.createdAt,
              unseenCount: (selectedUser?._id === otherId || newMessage.senderId === currentUserId)
                ? convo.unseenCount
                : convo.unseenCount + 1
            }
          }
          return convo;
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      });
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, selectedUser]);

  // When selectedUser changes, clear their unseen count locally
  useEffect(() => {
    if (selectedUser?._id) {
      setConversations(prev =>
        prev.map(convo =>
          convo._id === selectedUser._id ? { ...convo, unseenCount: 0 } : convo
        )
      );
    }
  }, [selectedUser]);

  return (
    <div className='w-full h-screen glass-strong overflow-hidden 
                    grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] lg:grid-cols-[1fr_2.3fr_1fr] fade-in'>
      <SideBar
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        conversations={conversations}
        setConversations={setConversations}
        onlineUsers={onlineUsers}
      />

      <ChatContainer
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
        setMessages={setMessages}
        socket={socket}
        setConversations={setConversations}
      />

      <RightSidebar
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
      />
    </div>
  )
}

export default HomePage
