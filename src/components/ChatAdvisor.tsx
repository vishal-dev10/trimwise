import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useChatAdvisor } from '@/hooks/use-chat-advisor';

interface ChatAdvisorProps {
  variant?: {
    name: string;
    ex_showroom_price: number;
    mileage_kmpl: number | null;
    engine_cc: number | null;
    transmission: string | null;
    horsepower: number | null;
    safety_rating: number | null;
  };
  car?: { brand: string; model: string; fuel_type: string; body_type: string };
  profile: {
    city: string;
    dailyUsageKm: number;
    highwayPct: number;
    ownershipYears: number;
    familySize: number;
    techPreference: string;
    drivingStyle: string;
    budgetMin: number;
    budgetMax: number;
  };
  trimScore?: number | null;
  stressLevel?: string | null;
  featureCount?: number;
}

const GENERIC_QUESTIONS = [
  'Which car is best for city driving under ₹15L?',
  'Petrol or diesel for 30km/day?',
  'How do I pick the right trim?',
  'Is a sunroof actually worth it?',
];

const VARIANT_QUESTIONS = (variantName?: string) => [
  `Is ${variantName ?? 'this trim'} worth the price?`,
  'Should I pick a higher trim instead?',
  'What features will I regret skipping?',
  'How much will this cost over 5 years?',
];

const ChatAdvisor = ({ variant, car, profile, trimScore, stressLevel, featureCount }: ChatAdvisorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context = {
    variant: variant ? {
      name: variant.name,
      price: variant.ex_showroom_price,
      mileage: variant.mileage_kmpl,
      engine_cc: variant.engine_cc,
      transmission: variant.transmission,
      horsepower: variant.horsepower,
      safety_rating: variant.safety_rating,
    } : undefined,
    car: car ? { brand: car.brand, model: car.model, fuel_type: car.fuel_type, body_type: car.body_type } : undefined,
    profile,
    trimScore,
    stressLevel,
    featureCount,
  };

  const { messages, isLoading, send, clearMessages } = useChatAdvisor(context);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    send(trimmed);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground elevated-shadow flex items-center justify-center hover:brightness-110 transition-all"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] z-50 bg-card border border-border rounded-2xl elevated-shadow flex flex-col"
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">TrimWise AI Advisor</p>
                  <p className="text-[10px] text-muted-foreground">
                    {variant ? `Analyzing ${variant.name}` : 'Ask anything about cars'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearMessages}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 min-h-0" style={{ maxHeight: 'calc(100dvh - 12rem)' }}>
              <div className="p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-sm text-muted-foreground">
                        👋 Hi! I'm your AI car advisor. Ask me anything about
                        {variant ? ` the **${variant.name}**` : ' car variants'} — features,
                        costs, or whether it's right for your needs.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {variant ? 'Try asking' : 'Quick questions'}
                      </p>
                      {(variant ? VARIANT_QUESTIONS(variant.name) : GENERIC_QUESTIONS).map(q => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="w-full text-left text-sm px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 text-foreground transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary/50 text-foreground rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this variant..."
                  disabled={isLoading}
                  className="flex-1 bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAdvisor;
