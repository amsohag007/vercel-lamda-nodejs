import { Pool } from 'pg';
import allowCors from '../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user specified by ID in the request body. User must me authenticated.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the user to delete
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not allowed to delete
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const deleteUserHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Missing auth token' });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  const { id: userIdToDelete } = req.body;
  if (typeof userIdToDelete !== 'number' || isNaN(userIdToDelete)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userIdToDelete]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Successfully deleted user' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    const client = await pool.connect();
    if (client) {
      await client.release();
    }
  }
};

export default allowCors(deleteUserHandler);
