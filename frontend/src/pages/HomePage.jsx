import React, { useState, useEffect, useContext } from 'react'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import SideBar from '../components/SideBar.jsx'
import { AuthContext } from '../../context/AuthContext'
import { getUsersForSidebar } from '../lib/utilis'
import toast from 'react-hot-toast'


const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [unseenMessages, setUnseenMessages] = useState({})
  const [messages, setMessages] = useState([])

  const { socket, onlineUsers } = useContext(AuthContext)

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsersForSidebar()
        if (response.success) {
          setUsers(response.users)
          setUnseenMessages(response.unseenMessages || {})
        } else {
          toast.error(response.message || 'Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users')
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className='gradient-main min-h-screen w-full flex items-center justify-center sm:p-8'>
      <div className='w-full h-screen sm:h-[90vh] sm:max-w-7xl glass-strong rounded-3xl overflow-hidden 
                      grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] lg:grid-cols-[1fr_2.3fr_1fr]'>
        <SideBar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          users={users}
          onlineUsers={onlineUsers}
          unseenMessages={unseenMessages}
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
    </div>
  )
}

export default HomePage
