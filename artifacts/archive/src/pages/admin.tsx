import { useState } from "react";
import { Link } from "wouter";
import {
  useListTopicSuggestions,
  useApproveTopicSuggestion,
  useRejectTopicSuggestion,
  useVerifyAdminKey,
  getListTopicSuggestionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SiteFooter } from "@/components/site-footer";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Inbox,
  ShieldAlert,
  Loader2,
  Clock,
  Check,
  X,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_KEY_STORAGE = "archive_admin_key";

function readStoredKey(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? "";
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [adminKey, setAdminKey] = useState<string>(readStoredKey);
  const [authed, setAuthed] = useState<boolean>(() => readStoredKey().length > 0);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    const data = (err as { data?: { error?: unknown } } | null)?.data;
    if (data && typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const persistKey = (key: string) => {
    setAdminKey(key);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    }
  };

  const lock = () => {
    setAuthed(false);
    setAdminKey("");
    setPasswordInput("");
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    }
  };

  const { mutate: verify, isPending: isVerifying } = useVerifyAdminKey({
    mutation: {
      onSuccess: () => {
        persistKey(passwordInput);
        setAuthed(true);
        setAuthError(null);
        setPasswordInput("");
      },
      onError: (err) => {
        setAuthError(
          extractErrorMessage(err, "Incorrect password. Access denied."),
        );
      },
    },
    request: { headers: { "x-admin-key": passwordInput } },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || isVerifying) return;
    setAuthError(null);
    verify();
  };

  const adminRequest = { headers: { "x-admin-key": adminKey } };

  const { data: suggestions, isLoading: loadingSuggestions } =
    useListTopicSuggestions({
      query: {
        queryKey: getListTopicSuggestionsQueryKey(),
        enabled: authed,
      },
    });

  const refreshAfterModeration = () => {
    queryClient.invalidateQueries({
      queryKey: getListTopicSuggestionsQueryKey(),
    });
    queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
  };

  const handleAuthFailure = (err: unknown) => {
    const status = (err as { status?: number } | null)?.status;
    if (status === 401) {
      lock();
      setAuthError("Your session expired. Please sign in again.");
    }
  };

  const {
    mutate: approve,
    isPending: isApproving,
    variables: approveVars,
  } = useApproveTopicSuggestion({
    mutation: {
      onSuccess: (topic) => {
        toast({
          title: "Suggestion approved",
          description: `"${topic.title}" is now live in the archive.`,
        });
        refreshAfterModeration();
      },
      onError: (err) => {
        handleAuthFailure(err);
        toast({
          title: "Approval failed",
          description: extractErrorMessage(err, "Could not approve."),
          variant: "destructive",
        });
      },
    },
    request: adminRequest,
  });

  const {
    mutate: reject,
    isPending: isRejecting,
    variables: rejectVars,
  } = useRejectTopicSuggestion({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Suggestion rejected",
          description: "It has been removed from the review queue.",
        });
        refreshAfterModeration();
      },
      onError: (err) => {
        handleAuthFailure(err);
        toast({
          title: "Rejection failed",
          description: extractErrorMessage(err, "Could not reject."),
          variant: "destructive",
        });
      },
    },
    request: adminRequest,
  });

  const busy = (id: number) =>
    (isApproving && approveVars?.id === id) ||
    (isRejecting && rejectVars?.id === id);

  return (
    <div className="min-h-screen bg-background relative pb-32 overflow-x-hidden">
      {/* Decorative scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-sm uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Archive
          </Link>
          {authed && (
            <button
              type="button"
              onClick={lock}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors font-mono text-xs uppercase tracking-widest"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-mono mb-6 uppercase"
        >
          <ShieldCheck className="w-3 h-3" />
          Restricted Access
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-mono uppercase font-bold leading-none mb-4"
        >
          Moderation <span className="text-primary">Console</span>
        </motion.h1>

        {!authed ? (
          /* Password gate */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl">
              This area is for archive administrators. Enter the access password
              to review pending topic suggestions.
            </p>

            <form
              onSubmit={handleLogin}
              className="border border-border bg-card/40 p-6 md:p-8 relative max-w-md"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />

              <label
                htmlFor="admin-password"
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                Access Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="Enter password"
                className="w-full bg-input/50 border border-border text-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
              />

              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    role="alert"
                    className="flex items-start gap-2 mt-4 border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 font-mono text-xs leading-relaxed"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={!passwordInput.trim() || isVerifying}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono uppercase text-sm tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Enter Console
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Review queue */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
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
                <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-mono mb-2">QUEUE EMPTY</h3>
                <p className="text-muted-foreground font-mono text-sm">
                  No suggestions awaiting review. All clear, agent.
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
                            onClick={() => reject({ id: s.id })}
                            disabled={busy(s.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground font-mono text-xs uppercase tracking-wider hover:border-destructive hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground"
                          >
                            {isRejecting && rejectVars?.id === s.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            Deny
                          </button>
                          <button
                            type="button"
                            onClick={() => approve({ id: s.id })}
                            disabled={busy(s.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isApproving && approveVars?.id === s.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Confirm
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
