import { useAdminGuard } from '@/hooks/use-admin-guard';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminGuard();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Verifying access…</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <ShieldAlert className="w-10 h-10 text-destructive" />
          <h2 className="font-display text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
