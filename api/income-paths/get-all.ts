import { Pool } from 'pg';
import allowCors from '../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import e, { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/income-paths/get-all:
 *   get:
 *     summary: Get all income paths for a user
 *     description: Retrieves all income paths associated with the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - IncomePaths
 *     responses:
 *       200:
 *         description: Successfully retrieved income paths
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   type:
 *                     type: string
 *                     enum: [basic, advanced]
 *                   description:
 *                     type: string
 *                   retirement_age:
 *                     type: integer
 *                   retirement_income_assets:
 *                     type: number
 *                   first_year_income:
 *                     type: number
 *                   created_date:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
*/
const getIncomePathsHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

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
    const result = await client.query('SELECT * FROM income_paths WHERE user_id = $1', [decoded.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error retrieving income paths:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};

export default allowCors(getIncomePathsHandler);
