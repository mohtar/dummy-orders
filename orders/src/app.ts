import {Request, Response, NextFunction} from 'express';
import * as orders from './orders';
import bodyParser from 'body-parser';
import express from 'express';
import redis from 'redis';

const redisClient = redis.createClient(process.env.REDIS_URL);

function wrapAsync(
  f: (req: Request, res: Response, next: NextFunction) => any,
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      return await f(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

const createOrder = wrapAsync(async (req, res) => {
  const order = await orders.create(req.body);
  redisClient.publish('events', JSON.stringify(order));
  res.json(order);
});

const retrieveOrder = wrapAsync(async (req, res) => {
  const {id} = req.params;
  const order = await orders.byId(id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({error: 'not_found'});
  }
});

const listOrders = wrapAsync(async (req, res) => {
  const {first, after = 0} = req.body;
  res.json(await orders.all(parseInt(first, 10), parseInt(after, 10)));
});

const transitionOrder = wrapAsync(async (req, res) => {
  const {id, transition} = req.params;
  const order = await orders.transitionOrder(id, transition);
  redisClient.publish('events', JSON.stringify(order));
  res.json(order);
});

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.get('/orders', listOrders);
app.post('/orders', createOrder);
app.get('/orders/:id', retrieveOrder);
app.post('/orders/:id/:transition', transitionOrder);

export default app;
