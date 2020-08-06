import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Order from './Order';
import OrderList from './OrderList';
import React from 'react';

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/orders/:id">
          <Order />
        </Route>
        <Route path="/">
          <OrderList />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
