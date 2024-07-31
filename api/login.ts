// api/login.ts
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Client } from 'pg'; // Using 'pg' for PostgreSQL client
import allowCors from './cors'; // Import the allowCors middleware
import { Request, Response } from 'express';

dotenv.config();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using email and returns a JSON Web Token (JWT).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Email & Password does not match.
 *       500:
 *         description: Internal server error
 */
const loginHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email & Password are required' });
    return;
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });

  try {
    await client.connect();

    const query = 'SELECT * FROM users WHERE email = $1'; // Change username to email
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Email & Password does not match.' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email & Password does not match.' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '4h' });
    res.status(200).json({ email: user.email, token }); // Return email instead of username
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
};

export default allowCors(loginHandler);