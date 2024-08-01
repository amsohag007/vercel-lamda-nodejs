import { Pool } from 'pg';
import allowCors from './cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * @swagger
 * /api/create-income-path:
 *   post:
 *     summary: Create a new income path
 *     description: Creates a new income path with the specified type (basic or advanced). Validates the required fields based on the type.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/IncomePathBasic'
 *               - $ref: '#/components/schemas/IncomePathAdvanced'
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
 * components:
 *   schemas:
 *     IncomePathCommon:
 *       type: object
 *       required:
 *         - user_id
 *         - type
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID of the user associated with the income path
 *         type:
 *           type: string
 *           enum: [basic, advanced]
 *           description: Type of the income path
 *         description:
 *           type: string
 *     IncomePathBasic:
 *       allOf:
 *         - $ref: '#/components/schemas/IncomePathCommon'
 *         - type: object
 *           required:
 *             - retirement_age
 *             - retirement_income_assets
 *             - first_year_income
 *             - spending_flexibility
 *             - equity_allocation
 *             - annuity_payout_rate
 *           properties:
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
 *     IncomePathAdvanced:
 *       allOf:
 *         - $ref: '#/components/schemas/IncomePathCommon'
 *         - type: object
 *           required:
 *             - retirement_age
 *             - retirement_income_assets
 *             - first_year_income
 *             - annuity_income
 *             - spending_flexibility_increase
 *             - spending_flexibility_decrease
 *             - allocation_to_stocks
 *             - social_security
 *             - inflation_adjustment
 *             - social_security_claiming_age
 *             - pension_benefit
 *             - pension_benefit_start_age
 *           properties:
 *             retirement_age:
 *               type: integer
 *             retirement_income_assets:
 *               type: number
 *             first_year_income:
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
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  const {
    user_id,
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

  if (!user_id || !type) {
    res.status(400).json({ message: 'user_id and type are required' });
    return;
  }

  let isValid = false;
  if (type === 'basic') {
    isValid = validateBasicFields(req.body);
  } else if (type === 'advanced') {
    isValid = validateAdvancedFields(req.body);
  }

  if (!isValid) {
    res.status(400).json({ message: 'Missing required fields for the specified type' });
    return;
  }

  try {
    const client = await pool.connect();

    try {
      let incomePathId: number | null = null;
      if (type === 'basic') {
        // Insert only basic fields
        const basicQuery = `
          INSERT INTO income_paths (
            user_id, type, description, retirement_age, retirement_income_assets,
            first_year_income, spending_flexibility, equity_allocation, annuity_payout_rate
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
        `;

        const basicValues = [
          user_id, type, description, retirement_age, retirement_income_assets,
          first_year_income, spending_flexibility, equity_allocation, annuity_payout_rate
        ];

        const result = await client.query(basicQuery, basicValues);
        incomePathId = result.rows[0].id;
      } else if (type === 'advanced') {
        // Insert advanced fields including basic ones
        const advancedQuery = `
          INSERT INTO income_paths (
            user_id, type, description, retirement_age, retirement_income_assets,
            first_year_income, annuity_income, spending_flexibility_increase,
            spending_flexibility_decrease, allocation_to_stocks, social_security,
            inflation_adjustment, social_security_claiming_age, pension_benefit,
            pension_benefit_start_age
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id
        `;

        const advancedValues = [
          user_id, type, description, retirement_age, retirement_income_assets,
          first_year_income, annuity_income, spending_flexibility_increase,
          spending_flexibility_decrease, allocation_to_stocks, social_security,
          inflation_adjustment, social_security_claiming_age, pension_benefit,
          pension_benefit_start_age
        ];

        const result = await client.query(advancedQuery, advancedValues);
        incomePathId = result.rows[0].id;
      }

      if (incomePathId !== null) {
        res.status(201).json({ id: incomePathId, message: 'Income path created successfully' });
      } else {
        res.status(500).json({ message: 'Failed to create income path' });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating income path:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateBasicFields = (data: any): boolean => {
  const { retirement_age, retirement_income_assets, first_year_income, spending_flexibility, equity_allocation, annuity_payout_rate } = data;
  return (
    retirement_age !== undefined &&
    retirement_income_assets !== undefined &&
    first_year_income !== undefined &&
    spending_flexibility !== undefined &&
    equity_allocation !== undefined &&
    annuity_payout_rate !== undefined
  );
};

const validateAdvancedFields = (data: any): boolean => {
  const { retirement_age, retirement_income_assets, first_year_income, annuity_income, spending_flexibility_increase, spending_flexibility_decrease, allocation_to_stocks, social_security, inflation_adjustment, social_security_claiming_age, pension_benefit, pension_benefit_start_age } = data;
  return (
    retirement_age !== undefined &&
    retirement_income_assets !== undefined &&
    first_year_income !== undefined &&
    annuity_income !== undefined &&
    spending_flexibility_increase !== undefined &&
    spending_flexibility_decrease !== undefined &&
    allocation_to_stocks !== undefined &&
    social_security !== undefined &&
    inflation_adjustment !== undefined &&
    social_security_claiming_age !== undefined &&
    pension_benefit !== undefined &&
    pension_benefit_start_age !== undefined
  );
};

export default allowCors(createIncomePathHandler);
