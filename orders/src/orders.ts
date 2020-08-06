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

export async function byId(id: string) {
  const client = await getMongoClient();
  const order = await client.db().collection('orders').findOne({id});
  if (order) {
    return order;
  } else {
    return null;
  }
}

export async function all(first: number, after: number) {
  const client = await getMongoClient();
  const orders = await client
    .db()
    .collection('orders')
    .find()
    .skip(after)
    .limit(first)
    .toArray();
  return orders;
}

export async function create(body: any) {
  const client = await getMongoClient();
  const id = uuid.v4();
  const {currency, amount} = body;
  const order = {id, status: 'created', currency, amount};
  await client.db().collection('orders').insertOne(order);
  return order;
}

export async function transitionOrder(id: string, transition: string) {
  const client = await getMongoClient();
  const session = client.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const order = await client.db().collection('orders').findOne({id});
      if (order) {
        const nextState = orderStateMachine.getNextState(
          order.status,
          transition,
        );
        if (nextState) {
          result = await client
            .db()
            .collection('orders')
            .findOneAndUpdate(
              {id},
              {$set: {status: nextState}},
              {returnOriginal: false},
            );
        } else {
          throw 'invalid_request';
        }
      } else {
        throw 'not_found';
      }
    });
    return result.value;
  } finally {
    await session.endSession();
  }
}
