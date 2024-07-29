require('dotenv').config();
const { Client } = require('pg');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const query = 'SELECT id FROM users WHERE email = $1';
  const result = await client.query(query, [email]);

  if (result.rows.length === 0) {
    client.end();
    return res.status(400).json({ message: 'Email not found' });
  }

  const userId = result.rows[0].id;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const resetLink = `${process.env.FE_DOMAIN}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false // Disable SSL verification
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  } finally {
    client.end();
  }
};