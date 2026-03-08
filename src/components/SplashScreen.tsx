import { motion } from 'framer-motion';
import { Car, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onGetStarted: () => void;
}

const SplashScreen = ({ onGetStarted }: SplashScreenProps) => {
  return (
    <div className="min-h-[100dvh] bg-hero-gradient flex flex-col items-center justify-center p-6 pb-safe relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(200 80% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(200 80% 60%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center z-10 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-primary/30 bg-primary/10"
        >
          <Car className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">TrimWise</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight tracking-tight"
        >
          Choose Your Car
          <br />
          <span className="text-primary">Intelligently.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-primary-foreground/60 mb-6 md:mb-10 leading-relaxed"
        >
          Stop guessing, start deciding. Compare trims, understand features, and know the true cost of owning your next car.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 md:py-6 text-lg rounded-xl gap-2 font-semibold"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 flex items-center justify-center gap-8 text-primary-foreground/40 text-sm"
        >
          <span>Trim Optimizer</span>
          <span className="w-1 h-1 rounded-full bg-primary/40" />
          <span>TCO Simulator</span>
          <span className="w-1 h-1 rounded-full bg-primary/40" />
          <span>Resale Planner</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
