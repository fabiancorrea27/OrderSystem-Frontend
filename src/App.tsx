import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import './App.css';

type Page = 'login' | 'register' | 'catalog' | 'cart' | 'orders' | 'admin';

function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>(user ? 'catalog' : 'login');

  function navigate(p: string) {
    setPage(p as Page);
  }

  function renderPage() {
    switch (page) {
      case 'login':    return <LoginPage onNavigate={navigate} />;
      case 'register': return <RegisterPage onNavigate={navigate} />;
      case 'catalog':  return <CatalogPage />;
      case 'cart':     return <CartPage onNavigate={navigate} />;
      case 'orders':   return <OrdersPage />;
      case 'admin':    return <AdminPage onNavigate={navigate} />;
      default:         return <CatalogPage />;
    }
  }

  return (
    <>
      <Navbar onNavigate={navigate} currentPage={page} />
      {renderPage()}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}
