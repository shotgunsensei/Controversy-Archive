import { useState } from "react";
import { Link } from "wouter";
import {
  useCreateTopicSuggestion,
  useListTopicSuggestions,
  useApproveTopicSuggestion,
  useRejectTopicSuggestion,
  getListTopicSuggestionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SiteFooter } from "@/components/site-footer";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  Inbox,
  ShieldAlert,
  Loader2,
  Clock,
  Check,
  X,
  KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TITLE_MIN = 3;
const TITLE_MAX = 200;
const CONTROVERSY_MIN = 10;
const CONTROVERSY_MAX = 2000;

const ADMIN_KEY_STORAGE = "archive_admin_key";

export default function Suggest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const [adminKey, setAdminKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(ADMIN_KEY_STORAGE) ?? "";
  });

  const updateAdminKey = (value: string) => {
    setAdminKey(value);
    if (typeof window !== "undefined") {
      if (value) window.localStorage.setItem(ADMIN_KEY_STORAGE, value);
      else window.localStorage.removeItem(ADMIN_KEY_STORAGE);
    }
  };

  const {
    data: suggestions,
    isLoading: loadingSuggestions,
  } = useListTopicSuggestions({
    query: { queryKey: getListTopicSuggestionsQueryKey() },
  });

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
        queryClient.invalidateQueries({
          queryKey: getListTopicSuggestionsQueryKey(),
        });
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

  const adminRequest = adminKey
    ? { headers: { "x-admin-key": adminKey } }
    : undefined;

  const refreshAfterModeration = () => {
    queryClient.invalidateQueries({
      queryKey: getListTopicSuggestionsQueryKey(),
    });
    queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
  };

  const { mutate: approve, isPending: isApproving, variables: approveVars } =
    useApproveTopicSuggestion({
      mutation: {
        onSuccess: (topic) => {
          toast({
            title: "Suggestion approved",
            description: `"${topic.title}" is now live in the archive.`,
          });
          refreshAfterModeration();
        },
        onError: (err) => {
          toast({
            title: "Approval failed",
            description:
              err instanceof Error ? err.message : "Could not approve.",
            variant: "destructive",
          });
        },
      },
      request: adminRequest,
    });

  const { mutate: reject, isPending: isRejecting, variables: rejectVars } =
    useRejectTopicSuggestion({
      mutation: {
        onSuccess: () => {
          toast({
            title: "Suggestion rejected",
            description: "It has been removed from the review queue.",
          });
          refreshAfterModeration();
        },
        onError: (err) => {
          toast({
            title: "Rejection failed",
            description:
              err instanceof Error ? err.message : "Could not reject.",
            variant: "destructive",
          });
        },
      },
      request: adminRequest,
    });

  const hasAdminKey = adminKey.trim().length > 0;

  const handleApprove = (id: number) => {
    if (!hasAdminKey) return;
    approve({ id });
  };

  const handleReject = (id: number) => {
    if (!hasAdminKey) return;
    reject({ id });
  };

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
    <div className="min-h-screen bg-background relative pb-32 overflow-x-hidden">
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
          submission lands in a moderation queue — nothing is published
          automatically.
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

        {/* Review Queue */}
        <div>
          <div className="flex items-center gap-2 mb-6 text-foreground">
            <Inbox className="w-5 h-5 text-primary" />
            <h2 className="font-mono text-xl uppercase font-bold tracking-tight">
              Review Queue
            </h2>
            {suggestions && (
              <span className="font-mono text-xs text-muted-foreground">
                [{suggestions.length} PENDING]
              </span>
            )}
          </div>

          {/* Admin moderation key */}
          <div className="mb-6 border border-border bg-card/40 p-4">
            <label
              htmlFor="admin-key"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              Moderator Key
            </label>
            <input
              id="admin-key"
              type="password"
              value={adminKey}
              onChange={(e) => updateAdminKey(e.target.value)}
              placeholder="Enter admin key to approve or reject"
              className="w-full bg-input/50 border border-border text-foreground px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
            />
            <p className="mt-2 font-mono text-[10px] text-muted-foreground/60 leading-relaxed">
              {hasAdminKey
                ? "Key stored on this device. Approve to publish a topic, reject to dismiss it."
                : "Without a valid key, suggestions are read-only. The key is stored only in this browser."}
            </p>
          </div>

          {loadingSuggestions ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-card animate-pulse border border-border"
                />
              ))}
            </div>
          ) : !suggestions || suggestions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border bg-card/30">
              <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-mono mb-2">QUEUE EMPTY</h3>
              <p className="text-muted-foreground font-mono text-sm">
                No suggestions awaiting review. Be the first to file one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {suggestions.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-mono font-bold text-lg leading-tight">
                        {s.title}
                      </h3>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {s.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {s.controversy}
                    </p>
                    <div className="mt-4 pt-3 border-t border-border border-dashed flex items-center justify-between gap-3 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                        Filed {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(s.id)}
                          disabled={
                            !hasAdminKey ||
                            (isRejecting && rejectVars?.id === s.id) ||
                            (isApproving && approveVars?.id === s.id)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground font-mono text-xs uppercase tracking-wider hover:border-destructive hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground"
                        >
                          {isRejecting && rejectVars?.id === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(s.id)}
                          disabled={
                            !hasAdminKey ||
                            (isApproving && approveVars?.id === s.id) ||
                            (isRejecting && rejectVars?.id === s.id)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isApproving && approveVars?.id === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
