import { Pool } from 'pg';
import allowCors from '../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/users/get-details-by-id:
 *   post:
 *     summary: Get user details by ID
 *     description: Retrieves details of a user specified by ID in the request body. The authenticated user must be an admin.
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
 *                 description: ID of the user to retrieve details for
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const getUserDetailsByIdHandler = async (req: Request, res: Response): Promise<void> => {
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

  const { id: userIdToRetrieve } = req.body;
  if (typeof userIdToRetrieve !== 'number' || isNaN(userIdToRetrieve)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id, email, created_at FROM users WHERE id = $1', [userIdToRetrieve]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};

export default allowCors(getUserDetailsByIdHandler);
