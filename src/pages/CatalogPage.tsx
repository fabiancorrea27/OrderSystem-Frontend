import { useState, useEffect, useMemo } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const sorted = useMemo(
    () => [...products].sort((a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0)),
    [products],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem, items } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    productService.getAll()
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(product: Product) {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1200);
  }

  function getQtyInCart(productId: string) {
    return items.find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  if (loading) return <div className={styles.state}>Cargando productos...</div>;
  if (error) return <div className={`${styles.state} ${styles.stateError}`}>{error}</div>;
  if (products.length === 0) return (
    <div className={styles.state}>
      <p>No hay productos disponibles aún.</p>
    </div>
  );

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Catálogo</h1>
        <span className={styles.count}>{products.length} productos</span>
      </div>

      <div className={styles.grid}>
        {sorted.map((product) => {
          const qty = getQtyInCart(product.id);
          const isJustAdded = added === product.id;
          return (
            <article key={product.id} className={`${styles.card} ${product.stock === 0 ? styles.cardDisabled : ''}`}>
              <div className={styles.cardImg}>
                <span className={styles.productEmoji}>📦</span>
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.name}>{product.name}</h2>
                <p className={styles.price}>
                  ${product.price.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </p>
                {product.stock === 0 ? (
                  <span className={styles.outOfStock}>Agotado</span>
                ) : product.stock <= 12 ? (
                  <span className={styles.lowStock}>⚠ Pocas unidades</span>
                ) : null}
              </div>
              <div className={styles.cardFooter}>
                {qty > 0 && (
                  <span className={styles.qtyBadge}>{qty} en carrito</span>
                )}
                <button
                  className={`${styles.addBtn} ${isJustAdded ? styles.addBtnDone : ''} ${product.stock === 0 ? styles.addBtnDisabled : ''}`}
                  onClick={() => handleAdd(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Agotado' : isJustAdded ? '✓ Agregado' : 'Agregar al carrito'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
