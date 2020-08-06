import React from 'react';
import {NavLink} from 'react-router-dom';

export default function OrderList() {
  const [data, setData] = React.useState<
    Array<{
      id: string;
      currency: string;
      amount: number;
      status: string;
    }>
  >();

  React.useEffect(() => {
    (async () => setData(await fetchData()))();
  }, []);

  return (
    <div>
      <h1>Order List</h1>
      <p>
        <button type="button" onClick={async () => setData(await fetchData())}>
          Refresh
        </button>
        <button
          type="button"
          onClick={async () => setData(await createOrder())}
        >
          Create Order
        </button>
      </p>
      <hr />
      {!data && <div>Loading…</div>}
      {data?.length == 0 && <div>Empty.</div>}
      {data?.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <tr>
                <td>
                  <NavLink to={`/orders/${order.id}`}>
                    <code>{order.id}</code>
                  </NavLink>
                </td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <hr />
    </div>
  );
}

async function fetchData() {
  const res = await fetch('/api/orders?limit=100');
  if (res.ok) {
    return await res.json();
  }
}

async function createOrder() {
  await fetch(`/api/orders`, {method: 'POST'});
  return await fetchData();
}
