import app from './app';
import request from 'supertest';

test('pay', async () => {
  const currency = 'myr';
  const amount = 500;

  const res = await request(app)
    .post('/payments')
    .send({currency, amount})
    .expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.currency).toEqual(currency);
  expect(res.body.amount).toEqual(amount);
  expect(res.body.status).toBeDefined();
});
