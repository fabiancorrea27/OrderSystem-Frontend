import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RouteWrapperProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RouteWrapperProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: RouteWrapperProps) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/catalog" replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: RouteWrapperProps) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/catalog" replace />;
  }

  return <>{children}</>;
}
