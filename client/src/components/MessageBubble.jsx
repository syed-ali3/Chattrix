import React, { useState } from 'react'
import { Trash2, X, Download } from 'lucide-react'

const MessageBubble = ({ message, isOwn, onDelete }) => {
  const [showImageModal, setShowImageModal] = useState(false)
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Download image handler
  const handleDownload = (url) => {
    fetch(url, { mode: 'cors' })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = url.split('/').pop().split('?')[0] || 'image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      })
      .catch(() => {
        window.open(url, '_blank')
      })
  }

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'} group relative`}>
          <div className={`flex items-center ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
            {/* Message bubble */}
            <div
              className={
                message.message_text === 'user deleted this message'
                  ? 'p-0 bg-transparent shadow-none'
                  : `px-3 py-1.5 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600/80 text-white rounded-br-md'
                        : 'bg-gray-200 text-gray-900 rounded-bl-md'
                    } max-w-[90vw]`
              }
            >
              {/* Show image if present and not a deleted message */}
              {message.image_url && message.message_text !== 'user deleted this message' && (
                <div className="mb-2 flex items-center">
                  {/* For other users, show download icon to the right of image */}
                  <img
                    src={message.image_url}
                    alt="Shared image"
                    className="max-w-full h-auto rounded-lg cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  {!isOwn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(message.image_url) }}
                      className="ml-2 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Download image"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
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

            {/* Trash and Download icons for own image messages */}
            {isOwn && message.message_text !== 'user deleted this message' && (
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => onDelete(message)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {message.image_url && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(message.image_url) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700"
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Timestamp below the message bubble, right-aligned */}
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-lg hover:bg-red-100 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6 text-red-500" />
            </button>
            <img
              src={message.image_url}
              alt="Enlarged"
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg border border-white"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MessageBubble
