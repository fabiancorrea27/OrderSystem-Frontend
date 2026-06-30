import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { RequireAuth, RequireAdmin, PublicRoute } from './routes/PrivateRoute';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/catalog" replace />}
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/catalog"
              element={
                <RequireAuth>
                  <CatalogPage />
                </RequireAuth>
              }
            />
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <CartPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <OrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
