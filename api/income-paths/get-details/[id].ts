// api/income-paths/get-details/[id].ts
import { Pool } from 'pg';
import allowCors from '../../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/income-paths/get-details/{id}:
 *   post:
 *     summary: Create a new income path
 *     description: Creates a new income path with only the description required. Other fields can be updated later.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - IncomePaths
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the income path
 *             required:
 *               - description
 *     responses:
 *       201:
 *         description: Income path created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

const getIncomePathDetailsHandler = async (req: Request, res: Response): Promise<void> => {
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

  if (!decoded.userId) {
    res.status(401).json({ message: 'Invalid token payload' });
    return;
  }

  const { id } = req.query;
  const incomePathId = parseInt(id as string, 10);
  if (isNaN(incomePathId)) {
    res.status(400).json({ message: 'Invalid income path ID' });
    return;
  }

  let client;
  try {
    client = await pool.connect(); // Get a client from the pool
    const result = await client.query('SELECT * FROM income_paths WHERE id = $1 AND user_id = $2', [incomePathId, decoded.userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Income path not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving income path details:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Only release the client, not the pool
    if (client) {
      client.release();
    }
  }
};


export default allowCors(getIncomePathDetailsHandler);