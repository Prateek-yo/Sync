import React, { useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime, getMessages, sendMessage, editMessage, deleteMessage } from '../lib/utilis'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'
import TypingIndicator from './TypingIndicator'
import ProfessionalAvatar from './ProfessionalAvatar'

const ChatContainer = ({ selectedUser, setSelectedUser, messages, setMessages, socket, setConversations }) => {
  const scrollEnd = useRef(null)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteMessageId, setDeleteMessageId] = useState(null)
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const currentUserId = JSON.parse(localStorage.getItem('userData'))?._id

  // Fetch messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) {
        setMessages([])
        return
      }

      try {
        const response = await getMessages(selectedUser._id)
        if (response.success) {
          setMessages(response.messages || [])
        } else {
          toast.error(response.message || 'Failed to load messages')
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
      }
    }

    fetchMessages()
  }, [selectedUser, setMessages])

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (newMessage) => {
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage])
      }
    }

    const handleMessageEdited = (editedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg))
      )
    }

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, deleted: true, text: null, image: null } : msg
        )
      )
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('messageEdited', handleMessageEdited)
    socket.on('messageDeleted', handleMessageDeleted)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('messageEdited', handleMessageEdited)
      socket.off('messageDeleted', handleMessageDeleted)
    }
  }, [socket, selectedUser, setMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle send message with Optimistic UI
  const handleSendMessage = async () => {
    if (!text.trim() && !image) return
    if (!selectedUser?._id) return

    const tempId = Date.now().toString();

    // 1. Create optimistic message
    const optimisticMessage = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: text,
      image: imagePreview, // Use preview for instant display
      createdAt: new Date().toISOString(),
      isOptimistic: true // Flag to identify it
    };

    // 2. Clear inputs immediately
    const sentText = text;
    const sentImage = image;
    setText('');
    setImage(null);
    setImagePreview(null);
    setShowEmojiPicker(false);

    // 3. Update messages locally for instant feedback
    setMessages(prev => [...prev, optimisticMessage]);

    // 4. Update sidebar conversation immediately
    if (setConversations) {
      setConversations(prev => {
        return prev.map(convo => {
          if (convo._id === selectedUser._id) {
            return {
              ...convo,
              lastMessage: optimisticMessage,
              lastMessageTime: optimisticMessage.createdAt
            }
          }
          return convo;
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      });
    }

    try {
      const response = await sendMessage(selectedUser._id, sentText, sentImage);
      if (response.success) {
        // Replace optimistic message with real one from server
        setMessages(prev => prev.map(msg => msg._id === tempId ? response.newMessage : msg));

        // Update sidebar with real message ID (important for later clicks)
        if (setConversations) {
          setConversations(prev => prev.map(convo =>
            convo._id === selectedUser._id ? { ...convo, lastMessage: response.newMessage } : convo
          ));
        }
      } else {
        // Remove optimistic message if failed
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
        toast.error(response.message || 'Failed to send message');
        // Restore text for user to try again
        setText(sentText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      toast.error('Failed to send message');
      setText(sentText);
    }
  }

  // Handle edit message
  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) return

    try {
      const response = await editMessage(messageId, editText)
      if (response.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? response.message : msg))
        )
        setEditingId(null)
        setEditText('')
        toast.success('Message updated')
      } else {
        toast.error(response.message || 'Failed to edit message')
      }
    } catch (error) {
      console.error('Error editing message:', error)
      toast.error('Failed to edit message')
    }
  }

  // Handle delete message
  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return

    try {
      const response = await deleteMessage(deleteMessageId)
      if (response.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === deleteMessageId ? { ...msg, deleted: true, text: null, image: null } : msg
          )
        )
        toast.success('Message deleted')
      } else {
        toast.error(response.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    } finally {
      setShowDeleteModal(false)
      setDeleteMessageId(null)
    }
  }

  const isOnline = selectedUser && socket?.connected

  return selectedUser ? (
    <div className='h-full overflow-y-scroll overflow-x-hidden relative'>
      {/* Header */}
      <div className='glass flex items-center gap-3 py-4 px-4 mx-3 mt-3 mb-2 rounded-xl'>
        {selectedUser?.avatar && selectedUser.avatar.name ? (
          <ProfessionalAvatar
            avatarData={selectedUser.avatar}
            size={40}
            fallbackName={selectedUser.fullName}
          />
        ) : selectedUser?.profilePic ? (
          <img
            src={selectedUser.profilePic}
            alt={selectedUser.fullName}
            className='w-10 h-10 rounded-full object-cover border-2 border-violet-500/50'
          />
        ) : (
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-semibold text-white border-2 border-violet-500/50'>
            {selectedUser?.fullName?.charAt(0).toUpperCase()}
          </div>
        )}

        <p className='flex-1 text-lg text-white font-medium flex items-center gap-2'>
          {selectedUser.fullName}
          {isOnline && <span className='w-2.5 h-2.5 rounded-full bg-green-500 pulse-dot'></span>}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="close"
          className='md:hidden max-w-7 cursor-pointer hover:opacity-70 transition-opacity'
        />

        <img src={assets.help_icon} alt="help" className='max-md:hidden max-w-5 opacity-70' />
      </div>

      {/* Messages Section */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.length > 0 ? (
          messages
            .filter((msg) => !msg.deleted) // Hide deleted messages completely
            .map((msg) => {
              const isSentByMe = msg.senderId === currentUserId

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 mb-8 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  onMouseEnter={() => setHoveredMessageId(msg._id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {/* Message content with relative positioning for buttons */}
                  <div className='relative'>
                    {editingId === msg._id ? (
                      <div className='flex flex-col gap-2 fade-in'>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className='modern-input'
                          autoFocus
                        />
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEditMessage(msg._id)}
                            className='modern-button text-sm'
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditText('')
                            }}
                            className='glass px-3 py-1 text-white rounded-lg hover:bg-white/10 text-sm transition-all'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : msg.image ? (
                      <div className='flex flex-col gap-1 fade-in'>
                        <img
                          src={msg.image}
                          alt="message"
                          className='max-w-[230px] rounded-xl shadow-lg'
                        />
                        {msg.text && (
                          <p className={isSentByMe ? 'message-sent' : 'message-received'}>
                            {msg.text}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className='fade-in'>
                        <p className={`md:text-sm break-all ${isSentByMe ? 'message-sent max-w-[250px]' : 'message-received max-w-[250px]'}`}>
                          {msg.text}
                        </p>
                      </div>
                    )}

                    {/* Options menu - positioned absolutely, shown on hover */}
                    {isSentByMe && !editingId && hoveredMessageId === msg._id && !msg.isOptimistic && (
                      <div className='absolute -top-8 right-0 flex gap-1 glass rounded-lg p-1.5 shadow-lg z-10 fade-in'>
                        <button
                          onClick={() => {
                            setEditingId(msg._id)
                            setEditText(msg.text || '')
                          }}
                          className='p-1.5 hover:bg-white/10 rounded text-sm transition-all'
                          title='Edit'
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setDeleteMessageId(msg._id)
                            setShowDeleteModal(true)
                          }}
                          className='p-1.5 hover:bg-white/10 rounded text-sm transition-all'
                          title='Delete'
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Avatar + Time */}
                  <div className="text-center text-xs">
                    {isSentByMe ? (
                      JSON.parse(localStorage.getItem('userData'))?.avatar?.name ? (
                        <ProfessionalAvatar
                          avatarData={JSON.parse(localStorage.getItem('userData')).avatar}
                          size={28}
                          fallbackName={JSON.parse(localStorage.getItem('userData')).fullName}
                          className='mx-auto'
                        />
                      ) : JSON.parse(localStorage.getItem('userData'))?.profilePic ? (
                        <img
                          src={JSON.parse(localStorage.getItem('userData')).profilePic}
                          alt="avatar"
                          className='w-7 h-7 rounded-full object-cover border border-white/20 mx-auto'
                        />
                      ) : (
                        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white border border-white/20 mx-auto'>
                          {JSON.parse(localStorage.getItem('userData'))?.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      selectedUser?.avatar?.name ? (
                        <ProfessionalAvatar
                          avatarData={selectedUser.avatar}
                          size={28}
                          fallbackName={selectedUser.fullName}
                          className='mx-auto'
                        />
                      ) : selectedUser?.profilePic ? (
                        <img
                          src={selectedUser.profilePic}
                          alt="avatar"
                          className='w-7 h-7 rounded-full object-cover border border-white/20 mx-auto'
                        />
                      ) : (
                        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white border border-white/20 mx-auto'>
                          {selectedUser?.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )
                    )}
                    <p className='message-time'>
                      {msg.isOptimistic ? 'Sending...' : formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
        ) : (
          <div className='flex items-center justify-center h-full text-gray-400'>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator userName={selectedUser?.fullName} />}

        <div ref={scrollEnd}></div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className='absolute bottom-20 left-4 glass rounded-xl p-3 fade-in'>
          <div className='relative'>
            <img src={imagePreview} alt="preview" className='max-w-[150px] rounded-lg' />
            <button
              onClick={() => {
                setImage(null)
                setImagePreview(null)
              }}
              className='absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center hover:shadow-lg transition-all'
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Bottom input area */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 mx-3 mb-3'>
        <div className='flex-1 flex items-center glass px-4 rounded-full hover-glow relative'>
          <input
            type="text"
            placeholder='Send a message'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
            className='flex-1 text-sm py-3 border-none outline-none text-white placeholder-slate-400 bg-transparent'
          />

          {/* Emoji Picker */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className='w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-all mr-2'
          >
            <span className='text-xl'>😀</span>
          </button>

          {showEmojiPicker && (
            <div className='emoji-picker-wrapper'>
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setText(prev => prev + emojiObject.emoji)
                  setShowEmojiPicker(false)
                }}
                theme='dark'
                height={400}
                width={320}
              />
            </div>
          )}

          <input
            type="file"
            id="image"
            accept='image/png, image/jpeg'
            onChange={handleImageChange}
            hidden
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="upload" className="w-5 cursor-pointer hover:opacity-70 transition-opacity" />
          </label>
        </div>

        {/* Professional Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!text.trim() && !image}
          className={`
            relative w-12 h-12 rounded-full flex items-center justify-center
            bg-gradient-to-r from-violet-600 to-purple-600 
            hover:from-violet-500 hover:to-purple-500
            shadow-lg shadow-violet-500/50
            hover:shadow-xl hover:shadow-violet-500/60
            transform hover:scale-105
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          <svg
            className='w-5 h-5 text-white transform translate-x-0.5'
            fill='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
          </svg>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in'>
          <div className='glass-strong rounded-2xl p-6 max-w-md w-full mx-4'>
            <h3 className='text-white text-xl font-semibold mb-4'>Delete Message</h3>
            <p className='text-slate-300 mb-6'>
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteMessageId(null)
                }}
                className='glass px-4 py-2 text-white rounded-lg hover:bg-white/10 transition-all'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                className='bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt="logo" />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
