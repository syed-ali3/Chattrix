// emailController.mjs or emailController.js (if "type": "module" in package.json)

import nodemailer from 'nodemailer';
import 'dotenv/config';
import pool from '../config/database.js';

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP and save to DB
export async function sendOtpAndSave(email) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Save OTP to DB
  await pool.query(
    `INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES ($1, $2, $3)`,
    [email, otp, expiresAt]
  );

  // Send email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: 'chattrix.help@gmail.com',
      pass: process.env.appPassword,
    },
  });

  const info = await transporter.sendMail({
    to: email,
    subject: "OTP verification",
    text: `Your OTP is ${otp}`,
    html:  `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #4CAF50;">🔐 Chattrix OTP Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="text-align: center; background: #e0f7fa; padding: 10px 0; border-radius: 8px; color: #00796b;">${otp}</h1>
        <p>Please use this code to complete your verification. This code will expire in 10 minutes.</p>
        <p style="font-size: 0.9em; color: #888;">If you did not request this, please ignore this email.</p>
        <p>Regards,<br>Chattrix Team</p>
      </div>
    </div>
  `,
  });

  console.log("OTP sent to", email, "MessageId:", info.messageId);
  return true;
}

// Verify OTP and mark as verified
export async function verifyOtpAndMark(email, enteredCode) {
  // Find OTP
  const result = await pool.query(
    `SELECT * FROM otp_verifications WHERE email = $1 AND otp_code = $2 AND expires_at > NOW() AND verified = FALSE ORDER BY created_at DESC LIMIT 1`,
    [email, enteredCode]
  );
  if (result.rows.length === 0) {
    return false;
  }
  // Mark as verified
  await pool.query(
    `UPDATE otp_verifications SET verified = TRUE WHERE id = $1`,
    [result.rows[0].id]
  );
  return true;
}
