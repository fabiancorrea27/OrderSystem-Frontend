import { useState, useEffect, type FormEvent } from 'react';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';
import styles from './AdminPage.module.css';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    productService.getAll().then(setProducts);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className={styles.state}>
        <span className={styles.icon}>🚫</span>
        <p>Acceso restringido a administradores.</p>
        <button className={styles.backBtn} onClick={() => onNavigate('catalog')}>
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
    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (isNaN(priceNum) || priceNum <= 0) { setError('El precio debe ser mayor que 0.'); return; }
    setLoading(true);
    try {
      const created = await productService.create(name.trim(), priceNum);
      setProducts((prev) => [...prev, created]);
      setSuccess(`Producto "${created.name}" creado correctamente.`);
      setName('');
      setPrice('');
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
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productPrice}>
                    ${p.price.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
