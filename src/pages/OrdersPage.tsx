import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    orderService.getMyOrders()
      .then(setOrders)
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.state}>Cargando pedidos...</div>;
  if (error) return <div className={`${styles.state} ${styles.stateError}`}>{error}</div>;

  if (orders.length === 0) {
    return (
      <div className={styles.state}>
        <span className={styles.emptyIcon}>📋</span>
        <p>Aún no tienes pedidos.</p>
      </div>
    );
  }

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Mis pedidos</h1>
      <p className={styles.subtitle}>{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total</p>

      <div className={styles.list}>
        {orders.map((order, idx) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className={styles.card}>
              <button
                className={styles.cardHeader}
                onClick={() => toggle(order.id)}
                aria-expanded={isOpen}
              >
                <div className={styles.headerLeft}>
                  <span className={styles.orderNum}>Pedido #{orders.length - idx}</span>
                  <span className={styles.date}>{formatDate(order.createdAt)}</span>
                </div>
                <div className={styles.headerRight}>
                  <span className={styles.total}>
                    ${order.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className={styles.cardBody}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cant.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productId.slice(0, 8)}…</td>
                          <td>${item.price.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                          <td>{item.quantity}</td>
                          <td>${item.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.orderTotal}>
                    Total: <strong>${order.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
