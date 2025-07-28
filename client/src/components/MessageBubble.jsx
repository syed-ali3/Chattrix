import React from 'react'
import { Trash2 } from 'lucide-react'

const MessageBubble = ({ message, isOwn, onDelete }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'} group relative`}>
        <div className={`flex items-center ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
          {/* Message bubble */}
          <div
            className={
              message.message_text === 'user deleted this message'
                ? 'p-0 bg-transparent shadow-none'
                : `px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-200 text-gray-900 rounded-bl-md'
                  }`
            }
          >
            {message.message_text === 'user deleted this message' ? (
              <p className="italic text-gray-500 border-gray-300 border-[0.5px] rounded-lg px-3 py-1 text-sm bg-transparent">
                {message.message_text}
              </p>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.message_text}
              </p>
            )}
          </div>

          {/* Trash icon shown only on hover (left side of own messages) */}
          {isOwn && message.message_text !== 'user deleted this message' && (
            <button
              onClick={() => onDelete(message)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              title="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Timestamp below the message bubble, right-aligned */}
        <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
