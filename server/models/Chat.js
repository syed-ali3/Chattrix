import pool from '../config/database.js'

class Chat {
  static async findOrCreate(user1Id, user2Id) {
    // Ensure consistent ordering for uniqueness
    const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id]
    
    // Check if chat already exists
    let query = `
      SELECT c.*, 
             u1.id as user1_id, u1.username as user1_username, u1.first_name as user1_first_name, u1.last_name as user1_last_name,
             u2.id as user2_id, u2.username as user2_username, u2.first_name as user2_first_name, u2.last_name as user2_last_name
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE (c.user1_id = $1 AND c.user2_id = $2) OR (c.user1_id = $2 AND c.user2_id = $1)
    `
    
    let result = await pool.query(query, [smallerId, largerId])
    
    if (result.rows.length > 0) {
      return this.formatChatRow(result.rows[0])
    }
    
    // Create new chat
    query = `
      INSERT INTO chats (user1_id, user2_id) 
      VALUES ($1, $2) 
      RETURNING *
    `
    
    result = await pool.query(query, [smallerId, largerId])
    const chatId = result.rows[0].id
    
    // Fetch the complete chat data
    query = `
      SELECT c.*, 
             u1.id as user1_id, u1.username as user1_username, u1.first_name as user1_first_name, u1.last_name as user1_last_name,
             u2.id as user2_id, u2.username as user2_username, u2.first_name as user2_first_name, u2.last_name as user2_last_name
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.id = $1
    `
    
    result = await pool.query(query, [chatId])
    return this.formatChatRow(result.rows[0])
  }

  static async findByUserId(userId) {
    const query = `
      SELECT c.*, 
             u1.id as user1_id, u1.username as user1_username, u1.first_name as user1_first_name, u1.last_name as user1_last_name,
             u2.id as user2_id, u2.username as user2_username, u2.first_name as user2_first_name, u2.last_name as user2_last_name,
             m.message_text as latest_message_text, m.created_at as latest_message_time, m.sender_id as latest_message_sender_id
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT message_text, created_at, sender_id
        FROM messages 
        WHERE chat_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) m ON true
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY COALESCE(m.created_at, c.id::text::timestamp) DESC
    `
    
    const result = await pool.query(query, [userId])
    return result.rows.map(row => this.formatChatWithLatestMessage(row))
  }

  static async findById(chatId, userId) {
    const query = `
      SELECT c.*, 
             u1.id as user1_id, u1.username as user1_username, u1.first_name as user1_first_name, u1.last_name as user1_last_name,
             u2.id as user2_id, u2.username as user2_username, u2.first_name as user2_first_name, u2.last_name as user2_last_name
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)
    `
    
    const result = await pool.query(query, [chatId, userId])
    return result.rows.length > 0 ? this.formatChatRow(result.rows[0]) : null
  }

  static formatChatRow(row) {
    return {
      id: row.id,
      user1_id: row.user1_id,
      user2_id: row.user2_id,
      user1: {
        id: row.user1_id,
        username: row.user1_username,
        first_name: row.user1_first_name,
        last_name: row.user1_last_name
      },
      user2: {
        id: row.user2_id,
        username: row.user2_username,
        first_name: row.user2_first_name,
        last_name: row.user2_last_name
      }
    }
  }

  static formatChatWithLatestMessage(row) {
    const chat = this.formatChatRow(row)
    if (row.latest_message_text || row.latest_message_time) {
      chat.latest_message = {
        message_text: row.latest_message_text,
        created_at: row.latest_message_time,
        sender_id: row.latest_message_sender_id
      }
    }
    return chat
  }
}

export default Chat