// api/income-paths/update/[id].ts
import { Pool } from 'pg';
import allowCors from '../../cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/income-paths/update/{id}:
 *   put:
 *     summary: Update an income path
 *     description: Updates a specific income path by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID of the income path to update
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: ['basic', 'advanced']
 *             description:
 *               type: string
 *             retirement_age:
 *               type: integer
 *             retirement_income_assets:
 *               type: number
 *             first_year_income:
 *               type: number
 *             spending_flexibility:
 *               type: number
 *             equity_allocation:
 *               type: number
 *             annuity_payout_rate:
 *               type: number
 *             annuity_income:
 *               type: number
 *             spending_flexibility_increase:
 *               type: number
 *             spending_flexibility_decrease:
 *               type: number
 *             allocation_to_stocks:
 *               type: number
 *             social_security:
 *               type: number
 *             inflation_adjustment:
 *               type: number
 *             social_security_claiming_age:
 *               type: integer
 *             pension_benefit:
 *               type: number
 *             pension_benefit_start_age:
 *               type: integer
 *     tags:
 *       - IncomePaths
 *     responses:
 *       200:
 *         description: Successfully updated income path
 *       404:
 *         description: Income path not found
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
const updateIncomePathHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'PUT') {
    res.status(405).json({ message: 'Only PUT method allowed' });
    return;
  }

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

  const {
    type,
    description,
    retirement_age,
    retirement_income_assets,
    first_year_income,
    spending_flexibility,
    equity_allocation,
    annuity_payout_rate,
    annuity_income,
    spending_flexibility_increase,
    spending_flexibility_decrease,
    allocation_to_stocks,
    social_security,
    inflation_adjustment,
    social_security_claiming_age,
    pension_benefit,
    pension_benefit_start_age,
  } = req.body;

  let client;
  try {
    client = await pool.connect(); // Get a client from the pool
    const result = await client.query(
      `UPDATE income_paths 
      SET 
        type = COALESCE($1, type),
        description = COALESCE($2, description),
        retirement_age = COALESCE($3, retirement_age),
        retirement_income_assets = COALESCE($4, retirement_income_assets),
        first_year_income = COALESCE($5, first_year_income),
        spending_flexibility = COALESCE($6, spending_flexibility),
        equity_allocation = COALESCE($7, equity_allocation),
        annuity_payout_rate = COALESCE($8, annuity_payout_rate),
        annuity_income = COALESCE($9, annuity_income),
        spending_flexibility_increase = COALESCE($10, spending_flexibility_increase),
        spending_flexibility_decrease = COALESCE($11, spending_flexibility_decrease),
        allocation_to_stocks = COALESCE($12, allocation_to_stocks),
        social_security = COALESCE($13, social_security),
        inflation_adjustment = COALESCE($14, inflation_adjustment),
        social_security_claiming_age = COALESCE($15, social_security_claiming_age),
        pension_benefit = COALESCE($16, pension_benefit),
        pension_benefit_start_age = COALESCE($17, pension_benefit_start_age),
        modified_at = CURRENT_TIMESTAMP
      WHERE id = $18 AND user_id = $19 RETURNING *`,
      [
        type,
        description,
        retirement_age,
        retirement_income_assets,
        first_year_income,
        spending_flexibility,
        equity_allocation,
        annuity_payout_rate,
        annuity_income,
        spending_flexibility_increase,
        spending_flexibility_decrease,
        allocation_to_stocks,
        social_security,
        inflation_adjustment,
        social_security_claiming_age,
        pension_benefit,
        pension_benefit_start_age,
        incomePathId,
        decoded.userId,
      ]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Income path not found' });
      return;
    }

    res.status(200).json({ message: 'Successfully updated income path', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating income path:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Only release the client, not the pool
    if (client) {
      client.release();
    }
  }
};

export default allowCors(updateIncomePathHandler);
