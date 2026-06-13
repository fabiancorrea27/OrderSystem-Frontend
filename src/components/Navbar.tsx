import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();

  function handleLogout() {
    logout();
    onNavigate('login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => onNavigate('catalog')}>
          <span className={styles.brandIcon}>📦</span>
          <span className={styles.brandName}>OrderSystem</span>
        </button>

        <nav className={styles.nav}>
          {user ? (
            <>
              <button
                className={`${styles.link} ${currentPage === 'catalog' ? styles.active : ''}`}
                onClick={() => onNavigate('catalog')}
              >
                Catálogo
              </button>
              <button
                className={`${styles.link} ${currentPage === 'orders' ? styles.active : ''}`}
                onClick={() => onNavigate('orders')}
              >
                Mis pedidos
              </button>
              {isAdmin && (
                <button
                  className={`${styles.link} ${currentPage === 'admin' ? styles.active : ''}`}
                  onClick={() => onNavigate('admin')}
                >
                  Admin
                </button>
              )}
            </>
          ) : null}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <>
              <button
                className={`${styles.cartBtn} ${currentPage === 'cart' ? styles.active : ''}`}
                onClick={() => onNavigate('cart')}
                aria-label={`Carrito — ${count} productos`}
              >
                🛒
                {count > 0 && <span className={styles.badge}>{count}</span>}
              </button>
              <span className={styles.email}>{user.email}</span>
              {isAdmin && <span className={styles.adminPill}>Admin</span>}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <button className={styles.link} onClick={() => onNavigate('login')}>
                Iniciar sesión
              </button>
              <button className={styles.registerBtn} onClick={() => onNavigate('register')}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
