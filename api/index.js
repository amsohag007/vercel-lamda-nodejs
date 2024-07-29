// module.exports = (req, res) => {
//   if (req.method === 'GET') {
//     res.status(200).send('Welcome to Income Path Vercel Serverless API Functions');
//   } else {
//     res.status(405).send('Method Not Allowed');
//   }
// };

const serverless = require('serverless-http');
const app = require('../index');

module.exports.handler = serverless(app);
