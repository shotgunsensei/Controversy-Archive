import { useState } from "react";
import { Link } from "wouter";
import { useCreateTopicSuggestion } from "@workspace/api-client-react";
import { SiteFooter } from "@/components/site-footer";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TITLE_MIN = 3;
const TITLE_MAX = 200;
const CONTROVERSY_MIN = 10;
const CONTROVERSY_MAX = 2000;

export default function Suggest() {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [controversy, setControversy] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const extractErrorMessage = (err: unknown): string => {
    const data = (err as { data?: { error?: unknown } } | null)?.data;
    if (data && typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
    if (err instanceof Error && err.message) return err.message;
    return "Submission failed. Please try again.";
  };

  const { mutate, isPending } = useCreateTopicSuggestion({
    mutation: {
      onSuccess: () => {
        setSubmitError(null);
        toast({
          title: "Submission received",
          description:
            "Your suggestion has entered the review queue. Thanks, agent.",
        });
        setTitle("");
        setControversy("");
      },
      onError: (err) => {
        const message = extractErrorMessage(err);
        setSubmitError(message);
        toast({
          title: "Submission rejected",
          description: message,
          variant: "destructive",
        });
      },
    },
  });

  const trimmedTitle = title.trim();
  const trimmedControversy = controversy.trim();
  const titleValid =
    trimmedTitle.length >= TITLE_MIN && trimmedTitle.length <= TITLE_MAX;
  const controversyValid =
    trimmedControversy.length >= CONTROVERSY_MIN &&
    trimmedControversy.length <= CONTROVERSY_MAX;
  const canSubmit = titleValid && controversyValid && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutate({ data: { title: trimmedTitle, controversy: trimmedControversy } });
  };

  return (
    <div className="archive-suggest min-h-screen bg-background relative pb-32 overflow-x-hidden">
      {/* Decorative scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-sm uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Archive
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-mono mb-6 uppercase"
        >
          <Send className="w-3 h-3" />
          Submit Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-mono uppercase font-bold leading-none mb-4"
        >
          Suggest a <span className="text-primary">Topic</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl leading-relaxed mb-10"
        >
          Found an anomaly the archive is missing? Submit it for review. Every
          submission is visible only to archive editors until they approve it for publication.
        </motion.p>

        {/* Submission Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="border border-border bg-card/40 p-6 md:p-8 mb-16 relative"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />

          <div className="mb-6">
            <label
              htmlFor="title"
              className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2"
            >
              Topic Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => {
                setTitle(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              placeholder="e.g. The Dancing Plague of 1518"
              className="w-full bg-input/50 border border-border text-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
            />
            <div className="mt-1 text-right">
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {trimmedTitle.length}/{TITLE_MAX}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="controversy"
              className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2"
            >
              Why is it controversial?
            </label>
            <textarea
              id="controversy"
              value={controversy}
              maxLength={CONTROVERSY_MAX}
              onChange={(e) => {
                setControversy(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              rows={5}
              placeholder="Lay out the debate, the competing theories, the unanswered questions..."
              className="w-full bg-input/50 border border-border text-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40 resize-y"
            />
            <div className="mt-1 text-right">
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {trimmedControversy.length}/{CONTROVERSY_MAX}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                className="flex items-start gap-2 mb-6 border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 font-mono text-xs leading-relaxed"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono uppercase text-sm tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transmitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Review
              </>
            )}
          </button>
        </motion.form>

      </main>

      <SiteFooter />
    </div>
  );
}
