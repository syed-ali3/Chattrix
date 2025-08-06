import express from 'express'
import User from '../models/User.js'
import { requireAuthQuery } from '../middleware/auth.js'
import pool from '../config/database.js'
import { cloudinary, storage } from '../config/cloudinary.js'
import multer from 'multer'
const upload = multer({ storage })
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

//update user profile
router.put('/:id', upload.single('profile_picture'), async (req, res) => {
  try {
    const { first_name, last_name, bio } = req.body
    const profile_picture = req.file ? req.file.path : null
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, bio = $3, profile_picture = $4
      WHERE id = $5
      RETURNING id, username, first_name, last_name, email, bio, profile_picture
    `
    const values = [first_name, last_name, bio, profile_picture, req.params.id]
    const { rows } = await pool.query(query, values)
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ user: rows[0] })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// get user's firstName, lastName ,bio ,username and profile picture and no of total chats by username
router.get('/by-username/:username',  async (req, res) => {
  try {
    const query = `
      SELECT first_name, last_name, bio, username, profile_picture,
        (SELECT COUNT(*) FROM chats WHERE user1_id = users.id OR user2_id = users.id) AS total_chats
      FROM users WHERE username = $1
    `;
    const { rows } = await pool.query(query, [req.params.username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { first_name, last_name, bio, username, profile_picture, total_chats } = rows[0];
    res.json({ first_name, last_name, bio, username, profile_picture, total_chats });
  } catch (error) {
    console.error('Get user by username error:', error.stack || error);
    res.status(500).json({ error: 'Failed to get user by username' });
  }
});

export default router