import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import styles from './CartPage.module.css';

const fmt = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 2 });

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, updateItemPrice, clearCart, total } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className={styles.state}>
        <p>Debes iniciar sesión para ver tu carrito.</p>
        <button className={styles.goBtn} onClick={() => navigate('/login')}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.successWrap}>
        <span className={styles.successIcon}>✅</span>
        <h2 className={styles.successTitle}>¡Pedido creado!</h2>
        <p className={styles.successMsg}>Tu pedido fue registrado correctamente.</p>
        <div className={styles.successActions}>
          <button className={styles.primaryBtn} onClick={() => navigate('/orders')}>
            Ver mis pedidos
          </button>
          <button className={styles.outlineBtn} onClick={() => navigate('/catalog')}>
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  const hasPriceWarning = items.some(
    (i) => i.currentPrice !== undefined && i.currentPrice !== i.product.price
  );

  if (items.length === 0) {
    return (
      <div className={styles.state}>
        <span className={styles.emptyIcon}>🛒</span>
        <p className={styles.emptyMsg}>Tu carrito está vacío.</p>
        <button className={styles.goBtn} onClick={() => navigate('/catalog')}>
          Ver catálogo
        </button>
      </div>
    );
  }

  async function handleCheckout() {
    setError('');
    setLoading(true);
    try {
      await orderService.createOrder(items);
      clearCart();
      setSuccess(true);
    } catch {
      setError('No se pudo crear el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Carrito</h1>

      <div className={styles.layout}>
        <div className={styles.itemsList}>
          {items.map((item) => {
            const priceChanged = item.currentPrice !== undefined && item.currentPrice !== item.product.price;
            return (
              <div key={item.product.id}>
                <div className={styles.item}>
                  <div className={styles.itemImg}>📦</div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.product.name}</p>
                    <p className={styles.itemPrice}>
                      ${fmt(item.product.price)} c/u
                    </p>
                  </div>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      aria-label="Reducir cantidad"
                    >−</button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      aria-label="Aumentar cantidad"
                    >+</button>
                  </div>
                  <p className={styles.itemSubtotal}>
                    ${fmt(item.product.price * item.quantity)}
                  </p>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Eliminar ${item.product.name}`}
                  >✕</button>
                </div>
                {priceChanged && (
                  <div className={styles.priceAlert}>
                    <span>⚠️ El precio cambió de <strong>${fmt(item.product.price)}</strong> a <strong>${fmt(item.currentPrice!)}</strong></span>
                    <div className={styles.priceAlertActions}>
                      <button className={styles.acceptPriceBtn} onClick={() => updateItemPrice(item.product.id, item.currentPrice!)}>
                        Usar ${fmt(item.currentPrice!)}
                      </button>
                      <button className={styles.dismissPriceBtn} onClick={() => removeItem(item.product.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumen</h2>
          <div className={styles.summaryRows}>
            {items.map((item) => (
              <div key={item.product.id} className={styles.summaryRow}>
                <span>{item.product.name} × {item.quantity}</span>
                <span>${fmt(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmount}>
              ${fmt(total)}
            </span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {hasPriceWarning && (
            <p className={styles.priceWarningMsg}>
              ⚠️ Hay productos con cambio de precio. Acepta el nuevo precio o quítalos antes de confirmar.
            </p>
          )}

          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={loading || hasPriceWarning}
          >
            {loading ? 'Procesando...' : 'Confirmar pedido'}
          </button>
          <button className={styles.clearBtn} onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>
      </div>
    </main>
  );
}
