import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonalizePromptProps {
  onPersonalize: () => void;
  compact?: boolean;
}

const PersonalizePrompt = ({ onPersonalize, compact }: PersonalizePromptProps) => {
  if (compact) {
    return (
      <button
        onClick={onPersonalize}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">
            Personalize this for YOU — takes 30 seconds
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-primary shrink-0" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">Want this tuned to YOU?</h3>
          <p className="text-sm text-muted-foreground">
            Tell us 5 things about your driving and we'll re-score every variant
            for your exact situation. Takes under a minute.
          </p>
        </div>
      </div>
      <Button onClick={onPersonalize} className="w-full rounded-xl gap-2">
        Personalize my recommendations
        <ChevronRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default PersonalizePrompt;
