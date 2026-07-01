import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../hooks/useTheme';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => navigate('/catalog')}>
          <span className={styles.brandIcon}>📦</span>
          <span className={styles.brandName}>OrderSystem</span>
        </button>

        <nav className={styles.nav}>
          {user ? (
            <>
              <NavLink
                to="/catalog"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                Catálogo
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                Mis pedidos
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                  Admin
                </NavLink>
              )}
            </>
          ) : null}
        </nav>

        <div className={styles.actions}>
          <button className={styles.themeBtn} onClick={toggle} aria-label="Cambiar tema">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <button
                className={styles.cartBtn}
                onClick={() => navigate('/cart')}
                aria-label={`Carrito — ${count} productos`}
              >
                🛒
                {count > 0 && <span className={styles.badge}>{count}</span>}
              </button>
              <button className={styles.profileBtn} onClick={() => navigate('/profile')}>
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
              </button>
              {isAdmin && <span className={styles.adminPill}>Admin</span>}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <button className={styles.link} onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
              <button className={styles.registerBtn} onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
