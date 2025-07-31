// emailController.mjs or emailController.js (if "type": "module" in package.json)
import nodemailer from 'nodemailer';
import 'dotenv/config';

const emailController = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: 'chattrix.help@gmail.com',
        pass: process.env.appPassword,
      },
    });

    const info = await transporter.sendMail({
      to: req.body.email,
      subject: "OTP verification",
      text: "Your OTP is 123456",
      html: "<b>Your OTP is 123456</b>",
    });

    console.log("Message sent:", info.messageId);
    res.json(info);
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

export default emailController;
