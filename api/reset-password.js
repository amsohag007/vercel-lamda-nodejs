require('dotenv').config();
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const client = new Client({ connectionString: process.env.POSTGRES_URL });
    await client.connect();

    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await client.query(query, [hashedPassword, decoded.userId]);

    client.end();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
