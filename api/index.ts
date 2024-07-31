import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../app'; // Adjust the path as necessary

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  app(req, res);
}