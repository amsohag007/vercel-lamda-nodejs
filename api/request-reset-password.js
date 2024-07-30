// api/request-reset-password.js
import dotenv from 'dotenv';
import { Client } from 'pg';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

dotenv.config();

/**
 * @swagger
 * /api/request-reset-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email to the user if the email is found.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Email is required or email not found
 *       500:
 *         description: Error sending email
 */
export default async function requestResetPasswordHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const query = 'SELECT id FROM users WHERE email = $1';
  const result = await client.query(query, [email]);

  if (result.rows.length === 0) {
    client.end();
    return res.status(400).json({ message: 'Email not found' });
  }

  const userId = result.rows[0].id;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const resetLink = `${process.env.FE_DOMAIN}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false // Disable SSL verification
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  } finally {
    client.end();
  }
}
