// api/login.js
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Client } from 'pg'; // Using 'pg' for PostgreSQL client
import allowCors from './cors'; // Import the allowCors middleware

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
async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email & Password are required' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });

  try {
    await client.connect();

    const query = 'SELECT * FROM users WHERE email = $1'; // Change username to email
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email & Password does not match.' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email & Password does not match.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '4h' });
    return res.status(200).json({ email: user.email, token }); // Return email instead of username
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}

export default allowCors(loginHandler);
