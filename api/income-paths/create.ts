import { Pool } from 'pg';
import allowCors from '../cors';
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
 *     description: Creates a new income path. Validates the required fields based on the specified type (basic or advanced).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/BasicIncomePath'
 *               - $ref: '#/components/schemas/AdvancedIncomePath'
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
 *     BasicIncomePath:
 *       type: object
 *       required:
 *         - type
 *         - retirement_age
 *         - retirement_income_assets
 *         - first_year_income
 *         - spending_flexibility
 *         - equity_allocation
 *         - annuity_payout_rate
 *       properties:
 *         type:
 *           type: string
 *           enum: [basic]
 *           description: Type of the income path
 *         description:
 *           type: string
 *         retirement_age:
 *           type: integer
 *         retirement_income_assets:
 *           type: number
 *         first_year_income:
 *           type: number
 *         spending_flexibility:
 *           type: number
 *         equity_allocation:
 *           type: number
 *         annuity_payout_rate:
 *           type: number
 *       example:
 *         type: basic
 *         description: Basic income path for retirement planning
 *         retirement_age: 65
 *         retirement_income_assets: 500000
 *         first_year_income: 40000
 *         spending_flexibility: 2000
 *         equity_allocation: 60
 *         annuity_payout_rate: 5
 *     AdvancedIncomePath:
 *       type: object
 *       required:
 *         - type
 *         - retirement_age
 *         - retirement_income_assets
 *         - first_year_income
 *         - annuity_income
 *         - spending_flexibility_increase
 *         - spending_flexibility_decrease
 *         - allocation_to_stocks
 *         - social_security
 *         - inflation_adjustment
 *         - social_security_claiming_age
 *         - pension_benefit
 *         - pension_benefit_start_age
 *       properties:
 *         type:
 *           type: string
 *           enum: [advanced]
 *           description: Type of the income path
 *         description:
 *           type: string
 *         retirement_age:
 *           type: integer
 *         retirement_income_assets:
 *           type: number
 *         first_year_income:
 *           type: number
 *         annuity_income:
 *           type: number
 *         spending_flexibility_increase:
 *           type: number
 *         spending_flexibility_decrease:
 *           type: number
 *         allocation_to_stocks:
 *           type: number
 *         social_security:
 *           type: number
 *         inflation_adjustment:
 *           type: number
 *         social_security_claiming_age:
 *           type: integer
 *         pension_benefit:
 *           type: number
 *         pension_benefit_start_age:
 *           type: integer
 *       example:
 *         type: advanced
 *         description: Advanced income path with detailed planning
 *         retirement_age: 65
 *         retirement_income_assets: 1000000
 *         first_year_income: 60000
 *         annuity_income: 30000
 *         spending_flexibility_increase: 1500
 *         spending_flexibility_decrease: 500
 *         allocation_to_stocks: 70
 *         social_security: 20000
 *         inflation_adjustment: 2
 *         social_security_claiming_age: 67
 *         pension_benefit: 15000
 *         pension_benefit_start_age: 65
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

  // Use user_id from decoded token
  console.log('User ID:', decoded);
  const user_id = decoded.userId; // Assuming the user ID is stored as 'id' in the token payload
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

  if (!type) {
    res.status(400).json({ message: 'Type is required' });
    return;
  }

  let isValid = false;
  if (type === 'basic') {
    isValid = validateBasicFields(req.body);
  } else if (type === 'advanced') {
    isValid = validateAdvancedFields(req.body);
  }

  if (!isValid) {
    res.status(400).json({ message: `Missing required fields for the ${type} type` });
    return;
  }

  try {
    const client = await pool.connect();

    try {
      let incomePathId: number | null = null;
      let incomePtahDescription = description || '';
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
        incomePtahDescription = result.rows[0].description;
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
        incomePtahDescription = result.rows[0].description;
      }

      if (incomePathId !== null) {
        res.status(201).json({ id: incomePathId, description: incomePtahDescription, message: 'Income path created successfully' });
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
