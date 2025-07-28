import express from 'express'
import User from '../models/User.js'
import { requireAuthQuery } from '../middleware/auth.js'

const router = express.Router()

// Search users by username
router.get('/search', requireAuthQuery, async (req, res) => {
  try {
    const { username } = req.query
    
    if (!username || username.trim().length === 0) {
      return res.json({ users: [] })
    }

    const users = await User.searchByUsername(username.trim(), req.user.id)
    res.json({ users })
  } catch (error) {
    console.error('User search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Get user profile
router.get('/:id', requireAuthQuery, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router