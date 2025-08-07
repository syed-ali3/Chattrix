import React, { useState, useRef, useEffect } from 'react'
import { Send, Image, User } from 'lucide-react'
import MessageBubble from './MessageBubble'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'


const ChatWindow = ({ chat, messages, onSendMessage, currentUser, setMessages }) => {
  const { socket } = useSocket()

  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() && !selectedImage) return
    if (!chat) return

    const messageData = {
      message_text: newMessage.trim() || null,
      image: selectedImage
    }

    setUploading(true)
    await onSendMessage(messageData)
    setNewMessage('')
    setSelectedImage(null)
    setUploading(false)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  const handleClickHeader = (username) => {
    console.log(`Clicked on header for user: ${username}`)
    navigate(`/view-profile`, { state: { username } })

  }

  // Handle message deletion
  const handleDeleteMessage = async (message) => {
    if (!chat) return
    if (!window.confirm('Are you sure you want to delete this message?')) return

    // Optimistically update UI
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id
          ? { ...m, message_text: 'user deleted this message', image_url: null }
          : m
      )
    )

    try {
      await axios.delete(`/api/chats/${chat.id}/messages/${message.id}?userId=${currentUser.id}`)
      if (socket) {
        console.log('Emitting delete-message', {
          chatId: chat.id,
          messageId: message.id
        }) // <-- 👈 this line helps debug
        socket.emit('delete-message', {
          chatId: chat.id,
          messageId: message.id
        })
      }

      // No further action needed — already updated in UI
    } catch (error) {
      alert('Failed to delete message')
      // Optionally rollback UI here
    }
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Welcome to Chattrix</p>
          <p>Select a chat or start a new conversation</p>
        </div>
      </div>
    )
  }

  const otherUser = chat.user1_id === currentUser.id ? chat.user2 : chat.user1

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4" onClick={() => { handleClickHeader(otherUser.username) }}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
            {otherUser.profile_picture ? (
              <img src={otherUser.profile_picture} alt="User Avatar" className="w-12 h-12 rounded-full" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="font-medium text-gray-900">
              {otherUser.first_name} {otherUser.last_name}
            </h2>
            <p className="text-sm text-gray-500">@{otherUser.username}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="mb-2">Start your conversation with {otherUser.first_name}</p>
              <p className="text-sm">Send a message to get things going!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUser.id}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {selectedImage && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Selected: {selectedImage.name}
              </span>
              <button
                onClick={removeSelectedImage}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            disabled={uploading}
            style={{ height: '40px', width: '40px' }}
          >
            <Image className="h-5 w-5" />
          </button>

          <div className="flex-1 flex items-center">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 align-middle"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={uploading}
              style={{ minHeight: '40px' }}
            />
          </div>

          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || uploading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ height: '40px', width: '40px' }}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow