import {MongoClient} from 'mongodb';
import {Request, Response, NextFunction} from 'express';
import {StateMachine} from './state-machine';
import * as uuid from 'uuid';
import bodyParser from 'body-parser';
import express from 'express';

const orderStateMachine: StateMachine<string, string> = new StateMachine([
  ['confirm', [['created', 'confirmed']]],
  [
    'cancel',
    [
      ['created', 'cancelled'],
      ['confirmed', 'cancelled'],
    ],
  ],
  ['deliver', [['confirmed', 'delivered']]],
]);

function getMongoClient(): Promise<MongoClient> {
  return MongoClient.connect(process.env.MONGO_URI);
}

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
  const client = await getMongoClient();
  const id = uuid.v4();
  const {currency, amount} = req.body;
  const order = {id, status: 'created', currency, amount};
  await client.db().collection('orders').insertOne(order);
  res.json(order);
});

const retrieveOrder = wrapAsync(async (req, res) => {
  const client = await getMongoClient();
  const {id} = req.params;
  const order = await client.db().collection('orders').findOne({id});
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({error: 'not_found'});
  }
});

const listOrders = wrapAsync(async (req, res) => {
  const client = await getMongoClient();
  const {first, after = 0} = req.body;
  const orders = await client
    .db()
    .collection('orders')
    .find()
    .skip(parseInt(after, 10))
    .limit(parseInt(first, 10))
    .toArray();
  res.json(orders);
});

const transitionOrder = wrapAsync(async (req, res) => {
  const client = await getMongoClient();
  const {id, transition} = req.params;
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await client.db().collection('orders').findOne({id});
      if (order) {
        const nextState = orderStateMachine.getNextState(
          order.status,
          transition,
        );
        if (nextState) {
          const result = await client
            .db()
            .collection('orders')
            .findOneAndUpdate(
              {id},
              {$set: {status: nextState}},
              {returnOriginal: false},
            );
          res.json(result.value);
        } else {
          res.status(400).json({error: 'invalid_request'});
        }
      } else {
        res.status(404).send({error: 'not_found'});
      }
    });
  } finally {
    await session.endSession();
  }
});

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.get('/orders', listOrders);
app.post('/orders', createOrder);
app.get('/orders/:id', retrieveOrder);
app.post('/orders/:id/:transition', transitionOrder);

export default app;
