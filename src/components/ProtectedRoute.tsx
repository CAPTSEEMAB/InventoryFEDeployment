// Route wrapper that redirects unauthenticated users to the login page
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// ProtectedRoute: shows a spinner while loading and redirects if not authenticated
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
