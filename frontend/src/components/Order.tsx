import React from 'react';
import {useParams, useHistory} from 'react-router-dom';

export default function Order() {
  const {id} = useParams();
  const history = useHistory();
  const [data, setData] = React.useState<{
    id: string;
    currency: string;
    amount: number;
    status: string;
  }>();

  React.useEffect(() => {
    (async () => setData(await fetchData(id)))();
  }, []);

  return (
    <div>
      <h1>Order {id}</h1>
      <p>
        <button type="button" onClick={() => history.push('/')}>
          Back to Order List
        </button>
        <button
          type="button"
          onClick={async () => setData(await fetchData(id))}
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={async () => setData(await cancelOrder(id))}
        >
          Cancel Order
        </button>
      </p>
      <hr />
      {!data && <div>Loading…</div>}
      {data && <div>Status: {data.status}</div>}
      <hr />
    </div>
  );
}

async function fetchData(id: string) {
  const res = await fetch(`/api/orders/${id}`);
  if (res.ok) {
    return await res.json();
  }
}

async function cancelOrder(id: string) {
  await fetch(`/api/orders/${id}/cancel`, {method: 'POST'});
  return await fetchData(id);
}
