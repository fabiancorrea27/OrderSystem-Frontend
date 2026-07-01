import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useToast, default as Toast } from '../components/Toast';
import type { Product } from '../types';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { toast, exiting, show: showToast } = useToast();

  useEffect(() => {
    if (!isAdmin) return;
    productService.getAll().then(setProducts);
  }, [isAdmin]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 12),
    [products],
  );

  if (!isAdmin) {
    return (
      <div className={styles.state}>
        <span className={styles.icon}>🚫</span>
        <p>Acceso restringido a administradores.</p>
        <button className={styles.backBtn} onClick={() => navigate('/catalog')}>
          Volver al catálogo
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (!name.trim()) { showToast('El nombre es obligatorio.', 'error'); return; }
    if (isNaN(priceNum) || priceNum <= 0) { showToast('El precio debe ser mayor que 0.', 'error'); return; }
    if (isNaN(stockNum) || stockNum < 0) { showToast('El stock debe ser 0 o mayor.', 'error'); return; }

    setLoading(true);
    try {
      const created = await productService.create(name.trim(), priceNum, stockNum);
      setProducts((prev) => [...prev, created]);
      showToast(`Producto "${created.name}" creado correctamente.`, 'success');
      setName('');
      setPrice('');
      setStock('');
    } catch {
      showToast('No se pudo crear el producto.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      {toast && <Toast data={toast} exiting={exiting} />}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Panel de administración</h1>
          <p className={styles.subtitle}>Gestión de productos</p>
        </div>
        <span className={styles.adminBadge}>Admin</span>
      </div>

      <div className={styles.layout}>
        {/* Create form */}
        <section className={styles.formCard}>
          <h2 className={styles.sectionTitle}>Nuevo producto</h2>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="pname" className={styles.label}>Nombre</label>
              <input
                id="pname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Laptop Gamer"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="pprice" className={styles.label}>Precio (COP)</label>
              <input
                id="pprice"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="pstock" className={styles.label}>Stock inicial</label>
              <input
                id="pstock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.createBtn} disabled={loading}>
              {loading ? 'Creando...' : '+ Crear producto'}
            </button>
          </form>
        </section>

        {/* Products list */}
        <section className={styles.listCard}>
          <h2 className={styles.sectionTitle}>
            Productos registrados
            <span className={styles.countBadge}>{products.length}</span>
          </h2>
          {products.length === 0 ? (
            <p className={styles.emptyList}>No hay productos aún.</p>
          ) : (
            <div className={styles.productList}>
              {products.map((p) => (
                <div key={p.id} className={styles.productRow}>
                  <span className={styles.productIcon}>📦</span>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{p.name}</span>
                    <span className={styles.productPrice}>
                      ${p.price.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={styles.productStock}>
                      Stock: {p.stock}
                      {p.stock <= 12 && (
                        <strong className={styles.lowStock}>
                          {p.stock === 0 ? ' Agotado' : ' Stock bajo'}
                        </strong>
                      )}
                    </span>
                  </div>
                  <div className={styles.inlineControls}>
                    <div className={styles.controlRow}>
                      <input
                        type="number"
                        min="0"
                        value={stockInputs[p.id] ?? ''}
                        onChange={(e) => setStockInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Stock"
                        className={styles.inputSmall}
                      />
                      <button
                        type="button"
                        className={styles.stockBtn}
                        onClick={async () => {
                          const value = parseInt(stockInputs[p.id] ?? '', 10);
                          if (Number.isNaN(value) || value < 0) {
                            showToast('El stock debe ser 0 o mayor.', 'error');
                            return;
                          }
                          setLoading(true);
                          try {
                            const updated = await productService.updateStock(p.id, value);
                            setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                            showToast(`Stock actualizado para ${updated.name}.`, 'success');
                            setStockInputs((prev) => ({ ...prev, [p.id]: '' }));
                          } catch {
                            showToast('No se pudo actualizar el stock.', 'error');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        Stock
                      </button>
                    </div>
                    <div className={styles.controlRow}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceInputs[p.id] ?? ''}
                        onChange={(e) => setPriceInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Precio"
                        className={styles.inputSmall}
                      />
                      <button
                        type="button"
                        className={styles.priceBtn}
                        onClick={async () => {
                          const value = parseFloat(priceInputs[p.id] ?? '');
                          if (isNaN(value) || value <= 0) {
                            showToast('El precio debe ser mayor que 0.', 'error');
                            return;
                          }
                          setLoading(true);
                          try {
                            const updated = await productService.updatePrice(p.id, value);
                            setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                            showToast(`Precio actualizado para ${updated.name}.`, 'success');
                            setPriceInputs((prev) => ({ ...prev, [p.id]: '' }));
                          } catch {
                            showToast('No se pudo actualizar el precio.', 'error');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        Precio
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className={styles.alertBox}>
              <strong>Atención:</strong> {lowStockProducts.length} producto{lowStockProducts.length === 1 ? '' : 's'} con stock bajo (≤ 12).
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
