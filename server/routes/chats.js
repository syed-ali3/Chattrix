import express from 'express'
import multer from 'multer'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import { requireAuth, requireAuthQuery } from '../middleware/auth.js'
import { cloudinary, storage } from '../config/cloudinary.js'

const router = express.Router()
const upload = multer({ storage })

// Get all user chats
router.get('/', requireAuthQuery, async (req, res) => {
  try {
    const chats = await Chat.findByUserId(req.user.id)
    res.json({ chats })
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({ error: 'Failed to get chats' })
  }
})

// Get specific chat
router.get('/:id', requireAuthQuery, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id, req.user.id)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    const messages = await Message.findByChatId(req.params.id)
    res.json({ chat, messages })
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({ error: 'Failed to get chat' })
  }
})

// Create or get chat
router.post('/', requireAuth, async (req, res) => {
  try {
    const { otherUserId } = req.body
    
    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' })
    }

    if (otherUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot create chat with yourself' })
    }

    const chat = await Chat.findOrCreate(req.user.id, otherUserId)
    res.json({ chat })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({ error: 'Failed to create chat' })
  }
})

// Get chat messages
router.get('/:id/messages', requireAuthQuery, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id, req.user.id)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    const messages = await Message.findByChatId(req.params.id)
    res.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to get messages' })
  }
})

// Send message
router.post('/:id/messages', upload.single('image'), requireAuth, async (req, res) => {
  try {
    const chatId = req.params.id
    const { message_text } = req.body

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId, req.user.id)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    const image_url = req.file ? req.file.path : null

    if (!message_text && !image_url) {
      return res.status(400).json({ error: 'Message text or image is required' })
    }

    const message = await Message.create({
      chat_id: chatId,
      sender_id: req.user.id,
      message_text: message_text || null,
      image_url
    })

    const fullMessage = await Message.findById(message.id)
    res.json({ message: fullMessage })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Delete a message (moved from deleteMessage.js)
router.delete('/:chatId/messages/:messageId', requireAuth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params
    // Find the message
    const message = await Message.findById(messageId)
    if (!message || message.chat_id != chatId) {
      return res.status(404).json({ error: 'Message not found' })
    }
    // If image, delete from Cloudinary
    if (message.image_url) {
      const publicId = message.image_url.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }
    // Mark as deleted for everyone
    await Message.markAsDeleted(messageId)
    return res.json({ deleted: true, notice: 'user deleted this message' })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

export default router