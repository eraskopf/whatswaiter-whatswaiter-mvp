import React from 'react';
import { io } from 'socket.io-client';

const socket = io();

function App() {
  const [orders, setOrders] = React.useState<string[]>([]);

  React.useEffect(() => {
    socket.on('order:new', (order: string) => {
      setOrders(prev => [...prev, order]);
    });
  }, []);

  return (
    <div>
      <h1>Pedidos</h1>
      <ul>
        {orders.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
