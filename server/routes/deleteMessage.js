import express from 'express'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import { requireAuth } from '../middleware/auth.js'
import { cloudinary } from '../config/cloudinary.js'

const router = express.Router()

// ...existing code...

// Delete a message
router.delete('/:chatId/messages/:messageId', requireAuth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params
    const userId = req.user.id

    // Find the message
    const message = await Message.findById(messageId)
    if (!message || message.chat_id != chatId) {
      return res.status(404).json({ error: 'Message not found' })
    }

    // Only sender can delete for themselves, receiver gets a notice
    if (message.sender_id === userId) {
      // If image, delete from Cloudinary
      if (message.image_url) {
        // Extract public_id from image_url
        const publicId = message.image_url.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      await Message.deleteById(messageId)
      return res.json({ deleted: true })
    } else {
      // Receiver: update message to show deleted notice
      await Message.markAsDeleted(messageId)
      return res.json({ deleted: true, notice: 'user deleted this message' })
    }
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

export default router
