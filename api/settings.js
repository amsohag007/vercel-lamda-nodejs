// api/updateUser.js
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Client } from 'pg'; // Using 'pg' for PostgreSQL client
import allowCors from './cors'; // Import the allowCors middleware

dotenv.config();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/settings:
 *   post:
 *     summary: Update user email and password
 *     description: Updates the user's email and/or password by verifying the old password and JWT token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               newEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Old password and/or new password are required
 *       401:
 *         description: Invalid credentials or JWT token
 *       500:
 *         description: Internal server error
 */
async function updateUserHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { oldPassword, newPassword, newEmail } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  // Check if oldPassword is provided when newPassword is also provided
  if (newPassword && !oldPassword) {
    return res.status(400).json({ message: 'Old password is required when updating the password' });
  }

  if (!token) {
    return res.status(401).json({ message: 'JWT token is required' });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid JWT token' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });

  try {
    await client.connect();

    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    let updatePassword = false;

    // Check if old password is provided and valid
    if (oldPassword && newPassword) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      updatePassword = true; // Proceed to update the password
    }

    const updates = [];
    const values = [];

    // Update password if applicable
    if (updatePassword) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = $1');
      values.push(hashedNewPassword);
    }

    // Update email if it is provided and different from the current email
    if (newEmail && newEmail !== user.email) {
      updates.push('email = $2');
      values.push(newEmail);
    }

    // Execute update query if there are any updates
    if (updates.length > 0) {
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
      values.push(userId); // Add userId to the end for the WHERE clause
      await client.query(updateQuery, values);
    }

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error during user update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}

export default allowCors(updateUserHandler);