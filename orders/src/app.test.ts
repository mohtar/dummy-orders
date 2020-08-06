import {MongoMemoryServer} from 'mongodb-memory-server';
import app from './app';
import mongodb from 'mongodb';
import request from 'supertest';

let mongod: MongoMemoryServer;

beforeAll(async (done) => {
  mongod = new MongoMemoryServer();
  process.env.MONGO_URI = await mongod.getUri();
  done();
});

afterAll(async (done) => {
  await mongod.stop();
  done();
});

test('list orders', async () => {
  const res = await request(app).get('/orders?first=10').expect(200);
});

test('create order', async () => {
  const currency = 'myr';
  const amount = 500;

  let id;

  {
    const res = await request(app)
      .post('/orders')
      .send({currency, amount})
      .expect(200);
    const order = res.body;
    id = order.id;
    expect(id).toBeDefined();
    expect(order.currency).toEqual(currency);
    expect(order.amount).toEqual(amount);
    expect(order.status).toEqual('created');
  }

  {
    const res = await request(app).get(`/orders/${id}`).expect(200);
    const order = res.body;
    expect(res.body.id).toEqual(id);
  }

  {
    const res = await request(app).get('/orders').send({first: 1}).expect(200);
    const order = res.body[0];
    expect(order.id).toEqual(id);
  }
});

test('retrieve bogus order', async () => {
  const id = 'bogus';
  await request(app).get(`/orders/${id}`).expect(404);
});

test('cancel order', async () => {
  let id;

  {
    const res = await request(app)
      .post('/orders')
      .send({currency: 'myr', amount: 500})
      .expect(200);
    id = res.body.id;
  }

  {
    const res = await request(app).post(`/orders/${id}/cancel`).expect(200);
    const order = res.body;
    expect(order.status).toEqual('cancelled');
  }

  // Cancel twice
  await request(app).post(`/orders/${id}/cancel`).expect(400);
});

test('cancel bogus order', async () => {
  const id = 'bogus';
  await request(app).post(`/orders/${id}/cancel`).expect(404);
});
