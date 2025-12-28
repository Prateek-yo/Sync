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

  return (
    <div className='w-full h-screen glass-strong overflow-hidden 
                    grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] lg:grid-cols-[1fr_2.3fr_1fr]'>
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
