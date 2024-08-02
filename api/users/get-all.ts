import { Pool } from 'pg';
import allowCors from '../cors';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/users/get-all:
 *   get:
 *     summary: Get all users
 *     description: Retrieves all users from the database. User must be authenticated.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
const getUsersHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Missing auth token' });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  console.log('decoded token', decoded);
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id, email, created_at FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};

export default allowCors(getUsersHandler);
