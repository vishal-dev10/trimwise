import { motion } from 'framer-motion';
import { Car, ChevronRight, Gauge, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onGetStarted: () => void;
}

const SplashScreen = ({ onGetStarted }: SplashScreenProps) => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-between p-6 pt-safe pb-safe relative overflow-hidden bg-[hsl(220,25%,4%)]">
      {/* Layered gradient backgrounds */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,30%,6%)] via-[hsl(210,35%,10%)] to-[hsl(200,40%,8%)]" />
        
        {/* Accent glow - top right */}
        <div className="absolute -top-[30%] -right-[20%] w-[70%] h-[60%] rounded-full bg-[hsl(200,80%,40%)] opacity-[0.08] blur-[120px]" />
        
        {/* Accent glow - bottom left */}
        <div className="absolute -bottom-[20%] -left-[30%] w-[60%] h-[50%] rounded-full bg-[hsl(200,85%,55%)] opacity-[0.06] blur-[100px]" />
        
        {/* Warm accent glow - center */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-[hsl(36,95%,55%)] opacity-[0.03] blur-[80px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(hsl(200 80% 50%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(200 80% 50%) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
        
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(220,25%,4%)_70%)]" />
      </div>

      {/* Top section - Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="z-10 pt-4 md:pt-8"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[hsl(200,80%,50%)]/20 bg-[hsl(200,80%,50%)]/5 backdrop-blur-sm">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[hsl(200,80%,45%)] to-[hsl(200,85%,60%)] flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-[hsl(200,80%,70%)]">TrimWise</span>
        </div>
      </motion.div>

      {/* Center section - Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        className="z-10 text-center max-w-lg flex-1 flex flex-col items-center justify-center"
      >
        {/* Decorative speedometer arc */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-6 md:mb-8 relative"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[hsl(200,80%,50%)]/20 flex items-center justify-center relative">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[hsl(200,80%,45%)]/10 to-transparent" />
            <Gauge className="w-8 h-8 md:w-10 md:h-10 text-[hsl(200,80%,55%)]" />
          </div>
          {/* Orbiting dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[hsl(36,95%,55%)] shadow-[0_0_8px_hsl(36,95%,55%)]" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-3 md:mb-5"
        >
          <span className="text-white">Choose Your Car</span>
          <br />
          <span className="bg-gradient-to-r from-[hsl(200,80%,50%)] via-[hsl(200,85%,60%)] to-[hsl(36,95%,55%)] bg-clip-text text-transparent">
            Intelligently.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-base md:text-lg text-[hsl(220,15%,55%)] mb-6 md:mb-8 leading-relaxed max-w-md px-2"
        >
          Stop guessing, start deciding. Compare trims, decode features, and master the true cost of your next car.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="relative group bg-gradient-to-r from-[hsl(200,80%,42%)] to-[hsl(200,85%,52%)] hover:from-[hsl(200,80%,48%)] hover:to-[hsl(200,85%,58%)] text-white px-8 py-5 md:py-6 text-lg rounded-2xl gap-2 font-semibold border-0 shadow-[0_0_30px_hsl(200,80%,50%,0.2)] hover:shadow-[0_0_40px_hsl(200,80%,50%,0.3)] transition-all duration-300"
          >
            Get Started
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom section - Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="z-10 w-full max-w-md pb-2 md:pb-4"
      >
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            { icon: Gauge, label: 'Trim Optimizer', color: 'hsl(200,80%,50%)' },
            { icon: TrendingUp, label: 'TCO Simulator', color: 'hsl(160,60%,45%)' },
            { icon: Shield, label: 'Resale Planner', color: 'hsl(36,95%,55%)' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,25%,8%)]/60 backdrop-blur-sm"
            >
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
              <span className="text-[11px] md:text-xs font-medium text-[hsl(220,15%,55%)] text-center leading-tight">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
