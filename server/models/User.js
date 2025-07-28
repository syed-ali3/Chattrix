import pool from '../config/database.js'
import bcrypt from 'bcryptjs'

class User {
  static async create({ username, first_name, last_name, email, password, bio }) {
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const query = `
      INSERT INTO users (username, first_name, last_name, email, password, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, first_name, last_name, email, bio, profile_picture
    `
    
    const values = [username, first_name, last_name, email, hashedPassword, bio]
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1'
    const result = await pool.query(query, [username])
    return result.rows[0]
  }

  static async findById(id) {
    const query = `
      SELECT id, username, first_name, last_name, email, bio, profile_picture 
      FROM users WHERE id = $1
    `
    const result = await pool.query(query, [id])
    return result.rows[0]
  }

  static async searchByUsername(username, excludeUserId) {
    const query = `
      SELECT id, username, first_name, last_name, bio, profile_picture 
      FROM users 
      WHERE username ILIKE $1 AND id != $2 
      ORDER BY username
      LIMIT 20
    `
    const result = await pool.query(query, [`%${username}%`, excludeUserId])
    return result.rows
  }

  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password)
  }
}

export default User