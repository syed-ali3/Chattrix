import express from 'express'
import User from '../models/User.js'
import { sendOtpAndSave, verifyOtpAndMark } from '../middleware/emailController.js'
const router = express.Router()

// Register: send OTP and save
router.post('/register', async (req, res) => {
  try {
    const { username, first_name, last_name, email, password, bio } = req.body;

    // Validation
    if (!username || !first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    // check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Send OTP and save to DB
    await sendOtpAndSave(email);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      if (error.constraint?.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (error.constraint?.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Account creation: verify OTP and create user
router.post('/accountCreation', async (req, res) => {
  const { email, enteredCode, userData } = req.body;
  if (!email || !enteredCode || !userData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Verify OTP
  const isValid = await verifyOtpAndMark(email, enteredCode);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  // Create user
  try {
    const { username, first_name, last_name, password, bio } = userData;
    const user = await User.create({
      username,
      first_name,
      last_name,
      email,
      password,
      bio: bio || null,
    });
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        bio: user.bio,
        profile_picture: user.profile_picture || null
      }
    });
  } catch (error) {
    console.error('Account creation error:', error);
    res.status(500).json({ error: 'Account creation failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user
    const user = await User.findByUsername(username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Validate password
    const isValid = await User.validatePassword(user, password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        bio: user.bio,
        profile_picture: user.profile_picture || null
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Logout (no longer needed but keeping for compatibility)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' })
})

export default router