import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Client } from 'pg';
import allowCors from '../cors';
import { Request, Response } from 'express';

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
 * /api/users/update:
 *   post:
 *     summary: Update user email and password by user ID
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
 *               id:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               newEmail:
 *                 type: string
 *     tags:
 *       - Users
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
async function updateUserByIdHandler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { id, oldPassword, newPassword, newEmail } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  // Check if oldPassword is provided when newPassword is also provided
  if (newPassword && !oldPassword) {
    res.status(400).json({ message: 'Old password is required when updating the password' });
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'JWT token is required' });
    return;
  }

  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
  } catch (error) {
    res.status(401).json({ message: 'Invalid JWT token' });
    return;
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });

  try {
    await client.connect();

    // Check if the user exists
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await client.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userResult.rows[0];
    let updatePassword = false;

    // Check if old password is provided and valid
    if (oldPassword && newPassword) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      updatePassword = true; // Proceed to update the password
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

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
      values.push(id); // Add userId to the end for the WHERE clause
      await client.query(updateQuery, values);
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error during user update:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}

export default allowCors(updateUserByIdHandler);
