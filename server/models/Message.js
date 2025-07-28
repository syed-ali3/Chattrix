import pool from '../config/database.js'

class Message {
  static async create({ chat_id, sender_id, message_text, image_url }) {
    const query = `
      INSERT INTO messages (chat_id, sender_id, message_text, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    
    const values = [chat_id, sender_id, message_text, image_url]
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  static async findByChatId(chatId) {
    const query = `
      SELECT m.*, u.username, u.first_name, u.last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at ASC
    `
    
    const result = await pool.query(query, [chatId])
    return result.rows
  }

  static async findById(messageId) {
    const query = `
      SELECT m.*, u.username, u.first_name, u.last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1
    `
    
    const result = await pool.query(query, [messageId])
    return result.rows[0]
  }

  static async deleteById(messageId) {
    const query = 'DELETE FROM messages WHERE id = $1'
    await pool.query(query, [messageId])
  }

  static async markAsDeleted(messageId) {
    const query = 'UPDATE messages SET message_text = $1, image_url = NULL WHERE id = $2'
    await pool.query(query, ['user deleted this message', messageId])
  }
}

export default Message