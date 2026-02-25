import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/use-admin-auth';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground font-display">Verifying access...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
