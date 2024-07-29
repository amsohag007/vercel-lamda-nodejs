module.exports = (req, res) => {
  if (req.method === 'GET') {
    res.status(200).send('Welcome to Income Path Vercel Serverless API Functions');
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
