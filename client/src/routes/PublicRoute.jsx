import useAuthStore from '../stores/authStore';
import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {

    const { user } = useAuthStore();

    if (user) {
        return <Navigate to="/admin/dashboard" replace />;
    }
  return children;
}