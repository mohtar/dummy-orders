import {Request, Response} from 'express';
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import axios, {Method} from 'axios';
import url from 'url';

async function api(req: Request, res: Response) {
  try {
    const response = await axios({
      method: req.method as Method,
      url: url.resolve(process.env.ORDERS_URL, req.url),
      data: req.body,
    });
    res.send(response.data);
  } catch (e) {
    console.error(e);
    res.status(e.response.status).send('');
  }
}

async function frontend(req: Request, res: Response) {
  const markup = ReactDOMServer.renderToStaticMarkup(
    <html>
      <body>
        <div id="main"></div>
        <script src="/static/js/main.js"></script>
      </body>
    </html>,
  );
  res.send(`<!doctype html>${markup}`);
}

const app = express();
app.use('/static', express.static('static'));
app.use('/api', api);
app.get('/*', frontend);

export default app;
