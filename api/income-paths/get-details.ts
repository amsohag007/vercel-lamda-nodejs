import { Pool } from 'pg';
import allowCors from '../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
/**
 * @swagger
 * /api/income-paths/{id}:
 *   get:
 *     summary: Get income path details
 *     description: Retrieves detailed information for a specific income path by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the income path
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved income path details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 type:
 *                   type: string
 *                   enum: [basic, advanced]
 *                 description:
 *                   type: string
 *                 retirement_age:
 *                   type: integer
 *                 retirement_income_assets:
 *                   type: number
 *                 first_year_income:
 *                   type: number
 *                 created_date:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Income path not found
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

  const incomePathId = parseInt(req.params.id);
  if (isNaN(incomePathId)) {
    res.status(400).json({ message: 'Invalid income path ID' });
    return;
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM income_paths WHERE id = $1 AND user_id = $2', [incomePathId, decoded.user_id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Income path not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving income path details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default allowCors(getIncomePathDetailsHandler);