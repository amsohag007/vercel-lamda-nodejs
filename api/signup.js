// api/signup.js
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import allowCors from './cors'; // Import the allowCors middleware

// Database connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Ensure this environment variable is set
});

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Creates a new user with an email and password.
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
 *       201:
 *         description: User created
 *       400:
 *         description: Email or password is missing or user already exists
 *       500:
 *         description: Internal server error
 */
async function signupHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    try {
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const query = 'INSERT INTO users (email, password) VALUES ($1, $2)';
      await client.query(query, [email, hashedPassword]);
      res.status(201).json({ message: 'User created' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default allowCors(signupHandler);
