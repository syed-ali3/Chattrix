import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { Search, Plus, LogOut, User, MessageSquare } from 'lucide-react'
import UserSearch from './UserSearch'
import axios from 'axios'

const Sidebar = ({ chats, selectedChat, onChatSelect, onNewChat }) => {
  const [showUserSearch, setShowUserSearch] = useState(false)
  const { user, logout } = useAuth()
  const { onlineUsers } = useSocket()

  const handleCreateChat = async (selectedUser) => {
    try {
      const response = await axios.post('/api/chats', {
        userId: user.id,
        otherUserId: selectedUser.id
      })

      onNewChat()
      onChatSelect(response.data.chat)
      setShowUserSearch(false)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId)
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Chattrix</h1>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setShowUserSearch(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center px-4">No chats yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => {
              const otherUser = chat.user1_id === user.id ? chat.user2 : chat.user1
              const isSelected = selectedChat?.id === chat.id
              const isOnline = isUserOnline(otherUser.id)
              
              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {otherUser.first_name} {otherUser.last_name}
                        </p>
                        {chat.latest_message && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.latest_message.created_at)}
                          </span>
                        )}
                      </div>
                      {/* <p className="text-sm text-gray-500 truncate">@{otherUser.username}</p> */}
                      {chat.latest_message && (
                        <p className="text-sm text-gray-600 truncate">
                          {chat.latest_message.sender_id === user.id
                            ? `You: ${chat.latest_message.message_text || 'Image'}`
                            : chat.latest_message.message_text || 'Image'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
          onUserSelect={handleCreateChat}
        />
      )}
    </div>
  )
}

export default Sidebar