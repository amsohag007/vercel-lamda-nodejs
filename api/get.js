const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
module.exports = (req, res) => {
  res.status(200).send('Welcome');
};