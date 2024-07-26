const express = require('express');

const app = express();

app.get('/', (req, res) => {
  console.log('Server is running on port 3000');
  res.send('Welcome to Vercel Servelss API Functions');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
module.exports = (req, res) => {
  res.status(200).send('Welcome');
};