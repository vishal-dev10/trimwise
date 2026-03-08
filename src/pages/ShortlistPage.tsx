import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Trash2, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShortlist } from '@/hooks/use-shortlist';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthPage from '@/pages/AuthPage';

const ShortlistPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { shortlist, isLoading, toggleShortlist, isToggling } = useShortlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Shortlist</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {shortlist.length} variant{shortlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : shortlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Car className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No variants saved yet</h2>
            <p className="text-muted-foreground mb-6">
              Tap the heart icon on any variant to add it to your shortlist.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Browse Cars
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {shortlist.map((item: any, i: number) => {
              const variant = item.variants;
              const car = variant?.cars;
              if (!variant || !car) return null;

              const onRoad = variant.ex_showroom_price * 1.15;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-2xl p-5 border border-border/50 card-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {car.brand} {car.model} · {car.year}
                      </p>
                      <h3 className="text-lg font-bold text-foreground mt-1">{variant.name}</h3>
                      <p className="text-xl font-bold text-foreground mt-1">
                        {formatPrice(variant.ex_showroom_price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        On-road ~{formatPrice(onRoad)}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge variant="outline" className="text-xs">{variant.engine_cc}cc</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{variant.transmission}</Badge>
                        {variant.mileage_kmpl && (
                          <Badge variant="outline" className="text-xs">{variant.mileage_kmpl} kmpl</Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">{car.fuel_type}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => toggleShortlist(variant.id)}
                      disabled={isToggling}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistPage;
