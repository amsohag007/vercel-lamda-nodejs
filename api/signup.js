const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // Using Pool for PostgreSQL client

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    if (!client) {
      return res.status(500).json({ message: 'Db error' });
    }

    try {
      const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
      await client.query(query, [username, hashedPassword]);
      res.status(201).json({ message: 'User created' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
