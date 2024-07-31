// api/reset-password.js
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Client } from 'pg';
import jwt from 'jsonwebtoken';
import allowCors from './cors'; // Import the allowCors middleware

dotenv.config();

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using a valid token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token for verification
 *                 example: abcdef123456
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Token and new password are required
 *       500:
 *         description: Error resetting password
 */
async function resetPasswordHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired! Try requesting reset password again' });
      }
      return res.status(401).json({ message: 'Invalid token! ' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const client = new Client({ connectionString: process.env.POSTGRES_URL });
    await client.connect();

    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await client.query(query, [hashedPassword, decoded.userId]);

    await client.end();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}

export default allowCors(resetPasswordHandler);
