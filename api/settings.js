async function updateUserHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { oldPassword, newPassword, newEmail } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  // Check if oldPassword is provided when newPassword is also provided
  if (newPassword && !oldPassword) {
    return res.status(400).json({ message: 'Old password is required when updating the password' });
  }

  if (!token) {
    return res.status(401).json({ message: 'JWT token is required' });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid JWT token' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });

  try {
    await client.connect();

    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Email & Password does not match.' });
    }

    const user = userResult.rows[0];
    let updatePassword = false;

    // Check if old password is provided and valid
    if (oldPassword && newPassword) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(401).json({ message: 'Email & Password does not match.' });
      }
      updatePassword = true; // Proceed to update the password
    }

    const updates = [];
    const values = [];

    // Update password if applicable
    if (updatePassword) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = $1');
      values.push(hashedNewPassword);
    }

    // Update email if it is provided and different from the current email
    if (newEmail && newEmail !== user.email) {
      // Check if the new email already exists
      const emailQuery = 'SELECT * FROM users WHERE email = $1';
      const emailResult = await client.query(emailQuery, [newEmail]);

      if (emailResult.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists! Try different email.' });
      }

      updates.push('email = $2');
      values.push(newEmail);
    }

    // Execute update query if there are any updates
    if (updates.length > 0) {
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
      values.push(userId); // Add userId to the end for the WHERE clause
      await client.query(updateQuery, values);
    }

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error during user update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}

export default allowCors(updateUserHandler);
