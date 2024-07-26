const bcrypt = require('bcrypt');
const { Client } = require('pg'); // Using 'pg' for PostgreSQL client

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
  await client.query(query, [username, hashedPassword]);

  client.end();
  res.status(201).json({ message: 'User created' });
};
