import pool from '../config/database.js'

export const requireAuth = async (req, res, next) => {
  try {
    let userId = req.body.userId
    // For DELETE requests, get userId from query
    if (req.method === 'DELETE') {
      userId = req.query.userId
    }
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' })
    }
    // Verify user exists
    const result = await pool.query(
      'SELECT id, username, first_name, last_name, email, bio, profile_picture FROM users WHERE id = $1',
      [userId]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid user' })
    }
    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

export const requireAuthQuery = async (req, res, next) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' })
    }

    // Verify user exists
    const result = await pool.query(
      'SELECT id, username, first_name, last_name, email, bio, profile_picture FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid user' })
    }
    
    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}