import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-muted-foreground">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">TrimWise</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl" required minLength={6} />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
