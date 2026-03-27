import { motion } from 'framer-motion';
import { Search, Filter, Car, Fuel, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCars } from '@/hooks/use-cars';
import { formatPrice } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

import hyundaiCreta from '@/assets/hyundai-creta.jpg';
import tataNexon from '@/assets/tata-nexon.jpg';
import marutiBrezza from '@/assets/maruti-brezza.jpg';
import mahindraScorpioN from '@/assets/mahindra-scorpio-n.jpg';

const carImageMap: Record<string, string> = {
  'hyundai creta': hyundaiCreta,
  'tata nexon': tataNexon,
  'maruti suzuki brezza': marutiBrezza,
  'mahindra scorpio n': mahindraScorpioN,
};

interface CarGridProps {
  onSelectCar: (carId: string) => void;
}

const CarGrid = ({ onSelectCar }: CarGridProps) => {
  const [search, setSearch] = useState('');
  const { data: cars, isLoading } = useCars();

  const filtered = cars?.filter(c =>
    `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const getBodyIcon = (type: string) => {
    return Car;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Choose Your Car</h1>
          <p className="text-sm text-muted-foreground mb-4">Select a car to explore variants and features</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand or model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-secondary/50 border-0"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((car, i) => {
              const Icon = getBodyIcon(car.body_type);
              return (
                <motion.button
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectCar(car.id)}
                  className="bg-card rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300 text-left group border border-border/50"
                >
                  {(() => {
                    const imgKey = `${car.brand} ${car.model}`.toLowerCase();
                    const imgSrc = car.image_url || carImageMap[imgKey];
                    return imgSrc ? (
                      <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-muted/30">
                        <img src={imgSrc} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover object-center" />
                      </div>
                    ) : null;
                  })()}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{car.brand}</p>
                      <h3 className="text-xl font-bold text-foreground">{car.model}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{car.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Fuel className="w-3 h-3" />
                      {car.fuel_type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Settings2 className="w-3 h-3" />
                      {car.body_type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {car.year}
                    </Badge>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No cars found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarGrid;
