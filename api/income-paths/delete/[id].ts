// api/income-paths/delete/[id].ts
import { Pool } from 'pg';
import allowCors from '../../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/income-paths/delete/{id}:
 *   delete:
 *     summary: Delete an income path
 *     description: Deletes a specific income path by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID of the income path to delete
 *     tags:
 *       - IncomePaths
 *     responses:
 *       200:
 *         description: Successfully deleted income path
 *       404:
 *         description: Income path not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
const deleteIncomePathHandler = async (req: Request, res: Response): Promise<void> => {
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
    const result = await client.query('DELETE FROM income_paths WHERE id = $1 AND user_id = $2 RETURNING *', [incomePathId, decoded.userId]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Income path not found' });
      return;
    }

    res.status(200).json({ message: 'Successfully deleted income path' });
  } catch (error) {
    console.error('Error deleting income path:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Only release the client, not the pool
    if (client) {
      client.release();
    }
  }
};

export default allowCors(deleteIncomePathHandler);
