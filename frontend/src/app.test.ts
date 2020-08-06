import app from './app';
import request from 'supertest';

test('frontend', async () => {
  await request(app).get('/').expect(200).expect('content-type', /html/);
});

test('api', async () => {
  await request(app).get('/api/test').expect(200);
});
