import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History } from 'lucide-react';
import { useAuditLog } from '@/hooks/use-admin-data';

const AdminVersionsPage = () => {
  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ['dataset-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_versions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: auditLog, isLoading: auditLoading } = useAuditLog();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dataset Versions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-display">Dataset Version History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {versionsLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse-soft">Loading...</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Version</TableHead>
                      <TableHead className="text-xs">Entity</TableHead>
                      <TableHead className="text-xs">Added</TableHead>
                      <TableHead className="text-xs">Updated</TableHead>
                      <TableHead className="text-xs">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(versions ?? []).map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="text-sm font-mono">v{v.version_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{v.entity_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-chart-positive">+{v.rows_added}</TableCell>
                        <TableCell className="text-sm text-accent">{v.rows_updated}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!versions || versions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                          No dataset versions yet. Import data via Data Management.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Admin Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse-soft">Loading...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-auto">
                {(auditLog ?? []).map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{log.action}</span> on <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {(!auditLog || auditLog.length === 0) && (
                  <div className="text-center text-sm text-muted-foreground py-8">No activity logged yet.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminVersionsPage;
