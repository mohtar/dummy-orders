import * as orders from './orders';
import axios from 'axios';
import redis from 'redis';
import url from 'url';

const client = redis.createClient(process.env.REDIS_URL);

client.subscribe('events');
client.on('message', async (_chan, message) => {
  const {order} = JSON.parse(message);
  if (order.status == 'created') {
    const {currency, amount} = order;
    const response = await axios.post(
      url.resolve(process.env.PAYMENTS_URL, 'payments'),
      {currency, amount},
    );
    const transitionMap = new Map([
      ['confirmed', 'confirm'],
      ['declined', 'cancel'],
    ]);
    const transition = transitionMap.get(response.data.status);
    await orders.transitionOrder(order.id, transition);
  }
});
