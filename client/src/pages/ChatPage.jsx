import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import axios from 'axios'

const ChatPage = () => {
  const { chatId } = useParams()
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (chatId) {
      fetchChatById(chatId)
    } else {
      setSelectedChat(null)
      setMessages([])
    }
  }, [chatId])

  // Track previous chat for leave event
  const prevChatIdRef = React.useRef(null)

  useEffect(() => {
    if (socket) {
      // Join the selected chat room
      if (selectedChat) {
        socket.emit('join-chat', selectedChat.id)
      }
      // Leave the previous chat room
      if (prevChatIdRef.current && prevChatIdRef.current !== (selectedChat && selectedChat.id)) {
        socket.emit('leave-chat', prevChatIdRef.current)
      }
      prevChatIdRef.current = selectedChat ? selectedChat.id : null

      socket.on('new-message', (message) => {
        if (selectedChat && message.chat_id === selectedChat.id) {
          setMessages(prev => [...prev, message])
        }
        // Update chat list with latest message
        fetchChats()
      })

      socket.on('delete-message', ({ chatId, messageId }) => {
        if (selectedChat && selectedChat.id === chatId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, message_text: 'user deleted this message', image_url: null }
                : m
            )
          )
        }
      })
      socket.on('message-deleted', ({ chatId, messageId }) => {
        if (selectedChat && selectedChat.id === chatId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, message_text: 'user deleted this message', image_url: null }
                : m
            )
          )
        }
      })



      return () => {
        socket.off('new-message')
        socket.off('delete-message') // ✅ cleanup
        socket.off('message-deleted')

        // Optionally leave the chat room on unmount
        if (selectedChat) {
          socket.emit('leave-chat', selectedChat.id)
        }
      }
    }
  }, [socket, selectedChat])

  const fetchChats = async () => {
    try {
      const response = await axios.get(`/api/chats?userId=${user.id}`)
      setChats(response.data.chats)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatById = async (id) => {
    try {
      const response = await axios.get(`/api/chats/${id}?userId=${user.id}`)
      setSelectedChat(response.data.chat)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching chat:', error)
    }
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    fetchChatMessages(chat.id)
  }

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/chats/${chatId}/messages?userId=${user.id}`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (messageData) => {
    if (!selectedChat) return

    try {
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('message_text', messageData.message_text || '')

      if (messageData.image) {
        formData.append('image', messageData.image)
      }

      const response = await axios.post(
        `/api/chats/${selectedChat.id}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      const newMessage = response.data.message
      // Only emit via socket, don't add to state here (will be handled by socket event)
      if (socket) {
        socket.emit('send-message', newMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-white">
      <Sidebar
        chats={chats}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onNewChat={fetchChats}
      />
      <ChatWindow
        chat={selectedChat}
        messages={messages}
        onSendMessage={sendMessage}
        currentUser={user}
        setMessages={setMessages}
      />
    </div>
  )
}

export default ChatPage