import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (isNaN(priceNum) || priceNum <= 0) { setError('El precio debe ser mayor que 0.'); return; }
    if (isNaN(stockNum) || stockNum < 0) { setError('El stock debe ser 0 o mayor.'); return; }

    setLoading(true);
    try {
      const created = await productService.create(name.trim(), priceNum, stockNum);
      setProducts((prev) => [...prev, created]);
      setSuccess(`Producto "${created.name}" creado correctamente.`);
      setName('');
      setPrice('');
      setStock('');
    } catch {
      setError('No se pudo crear el producto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
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

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}

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
                  <div className={styles.stockUpdate}>
                    <input
                      type="number"
                      min="0"
                      value={stockInputs[p.id] ?? ''}
                      onChange={(e) => setStockInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder="Nueva cantidad"
                      className={styles.inputSmall}
                    />
                    <button
                      type="button"
                      className={styles.stockBtn}
                      onClick={async () => {
                        const value = parseInt(stockInputs[p.id] ?? '', 10);
                        if (Number.isNaN(value) || value < 0) {
                          setError('El stock debe ser 0 o mayor.');
                          return;
                        }
                        setError('');
                        setLoading(true);
                        try {
                          const updated = await productService.updateStock(p.id, value);
                          setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                          setSuccess(`Stock actualizado para ${updated.name}.`);
                          setStockInputs((prev) => ({ ...prev, [p.id]: '' }));
                        } catch {
                          setError('No se pudo actualizar el stock.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      Guardar
                    </button>
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
