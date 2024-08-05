import { Pool } from 'pg';
import allowCors from '../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * tags:
 *   - name: IncomePaths
 *     description: Operations related to income paths
 */

/**
 * @swagger
 * /api/income-paths/create:
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

const createIncomePathHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'POST') {
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

  const user_id = decoded.userId; // Assuming the user ID is stored as 'userId' in the token payload
  const { description } = req.body;

  if (!description) {
    res.status(400).json({ message: 'Description is required' });
    return;
  }

  try {
    const client = await pool.connect();

    try {
      const query = `
        INSERT INTO income_paths (user_id, description)
        VALUES ($1, $2)
        RETURNING id
      `;
      const values = [user_id, description];
      const result = await client.query(query, values);
      const incomePathId = result.rows[0].id;

      res.status(201).json({ id: incomePathId, message: 'Income path created successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating income path:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default allowCors(createIncomePathHandler);
