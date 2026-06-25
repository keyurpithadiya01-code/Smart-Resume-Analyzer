import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminRoute({ children }) {
  const { isLoggedIn, user } = useAuth();
  
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  
  return children;
}
