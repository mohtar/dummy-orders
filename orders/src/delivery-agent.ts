import * as orders from './orders';
import axios from 'axios';
import redis from 'redis';
import url from 'url';

const client = redis.createClient(process.env.REDIS_URL);

client.subscribe('events');
client.on('message', async (_chan, message) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const {order} = JSON.parse(message);
  if (order.status == 'confirmed') {
    await orders.transitionOrder(order.id, 'deliver');
  }
});
