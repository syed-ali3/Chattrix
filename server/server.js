import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

import pool from './config/database.js'

// Routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import chatRoutes from './routes/chats.js'


dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chats', chatRoutes)


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Socket.IO connection handling
const onlineUsers = new Set()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('user-online', (userId) => {
    onlineUsers.add(userId)
    socket.userId = userId
    io.emit('online-users', Array.from(onlineUsers))
  })

  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`)
  })

  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat-${chatId}`)
  })

  socket.on('send-message', (message) => {
  io.emit('new-message', message)
})

socket.on('delete-message', ({ chatId, messageId }) => {
  socket.to(`chat-${chatId}`).emit('delete-message', { chatId, messageId })
})


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    if (socket.userId) {
      onlineUsers.delete(socket.userId)
      io.emit('online-users', Array.from(onlineUsers))
    }
  })
})

const PORT = process.env.PORT || 5000

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    pool.end()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    pool.end()
    process.exit(0)
  })
})