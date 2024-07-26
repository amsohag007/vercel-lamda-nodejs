require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Client } = require('pg'); // Using 'pg' for PostgreSQL client

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await client.query(query, [username]);

  if (result.rows.length === 0) {
    client.end();
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    client.end();
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '4h' });
  client.end();

  res.status(200).json({ token });
};
