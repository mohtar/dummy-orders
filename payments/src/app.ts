import {Request, Response} from 'express';
import express from 'express';
import * as uuid from 'uuid';

async function createPayment(req: Request, res: Response) {
  const id = uuid.v4();
  const currency = req.body.currency;
  const amount = req.body.amount;
  const statuses = ['confirmed', 'declined'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  res.json({id, currency, amount, status});
}

const app = express();
app.use(express.json());
app.post('/payments', createPayment);

export default app;
