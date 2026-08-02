import { useState } from "react";
import { Link, useParams } from "wouter";
import { 
  useGetTopic, 
  useGetTopicDeepDive,
  getGetTopicQueryKey,
  getGetTopicDeepDiveQueryKey
} from "@workspace/api-client-react";
import { Markdown } from "@/components/markdown";
import { SiteFooter } from "@/components/site-footer";
import { ArrowLeft, Clock, MapPin, Tag, Activity, AlertTriangle, Cpu, CheckCircle2, FileQuestion, Target, Command } from "lucide-react";
import { motion } from "framer-motion";

export default function TopicDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const [imgError, setImgError] = useState(false);
  
  const { data: topic, isLoading: topicLoading, error: topicError } = useGetTopic(slug, {
    query: { enabled: !!slug, queryKey: getGetTopicQueryKey(slug) }
  });
  
  // The deep dive query will take 10-20s on first load
  const { data: deepDive, isLoading: diveLoading, isError: diveIsError, refetch: retryDive } = useGetTopicDeepDive(slug, {
    query: { 
      enabled: !!slug, 
      queryKey: getGetTopicDeepDiveQueryKey(slug),
      staleTime: 1000 * 60 * 60, // 1 hour
      retry: 1 // limit retries to avoid storming the slow endpoint
    }
  });

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <p className="font-mono text-primary animate-pulse uppercase tracking-widest">Accessing secure files...</p>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4 uppercase">FILE NOT FOUND</h1>
        <p className="text-muted-foreground mb-8 max-w-md font-mono">The requested dossier has been redacted, moved, or never existed in the first place.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground font-mono uppercase text-sm hover:bg-primary/90 transition-colors">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-0">
      {/* Decorative scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-20 bg-[linear-gradient(rgba(0,229,255,0.02)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,229,255,0.06),rgba(124,58,237,0.02),rgba(224,7,0,0.03))] bg-[length:100%_4px,3px_100%]" />
      
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-sm uppercase">
            <ArrowLeft className="w-4 h-4" />
            Archive
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-4xl pb-16">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Hero image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden border border-border bg-muted mb-8 group">
            {topic.imageUrl && !imgError ? (
              <img
                src={`${import.meta.env.BASE_URL}${topic.imageUrl}`}
                alt={topic.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(0,229,255,0.04)_12px,rgba(0,229,255,0.04)_24px)]">
                <FileQuestion className="w-16 h-16 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-primary/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-primary/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-primary/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-primary/60" />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              {topic.category}
            </span>
            {topic.featured && (
              <span className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 font-mono text-xs uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(224,7,0,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                CLASSIFIED
              </span>
            )}
            <span className="text-muted-foreground font-mono text-xs flex items-center gap-1.5 ml-auto">
              ID: {topic.id.toString().padStart(6, '0')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase mb-6 leading-[1.1] tracking-tight">
            {topic.title}
          </h1>
          
          <div className="flex flex-wrap gap-6 mb-8 text-sm font-mono text-muted-foreground border-y border-border py-4 bg-muted/20 px-4">
            {topic.era && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>ERA: {topic.era}</span>
              </div>
            )}
            {topic.origin && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>ORIGIN: {topic.origin}</span>
              </div>
            )}
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xl leading-relaxed text-foreground mb-6 font-medium">
              {topic.summary}
            </p>
            <div className="bg-muted/30 border-l-2 border-secondary p-6">
              <h3 className="text-xs font-header tracking-widest text-secondary uppercase mb-2">Why it's controversial</h3>
              <p className="text-muted-foreground italic m-0">{topic.controversy}</p>
            </div>
          </div>
          
          {topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
              {topic.tags.map(tag => (
                <span key={tag} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-border px-2 py-1 bg-card/30">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Deep Dive Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 border border-border bg-card relative overflow-hidden"
        >
          {/* Header of deep dive */}
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-header font-bold text-sm uppercase tracking-widest">
              <Cpu className="w-4 h-4 text-primary" />
              Operator Intel
            </div>
            {!diveLoading && deepDive && (
              <span className="text-xs font-mono text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> COMPILED
              </span>
            )}
          </div>

          <div className="p-6 md:p-10 min-h-[300px]">
            {diveLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-border rounded-full" />
                  <div className="absolute inset-0 w-24 h-24 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-2 font-mono">
                  <h4 className="text-primary text-lg">GENERATING DOSSIER</h4>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    OperatorOS agents are currently scouring archives, forums, and dark-net records to compile a comprehensive analysis of this topic. This may take 10-20 seconds.
                  </p>
                </div>
              </div>
            ) : diveIsError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <AlertTriangle className="w-16 h-16 text-destructive" />
                <div className="space-y-2 font-mono">
                  <h4 className="text-destructive text-lg uppercase">Compilation Failed</h4>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    The agent encountered an anomaly while compiling the dossier. Interference detected.
                  </p>
                </div>
                <button 
                  onClick={() => retryDive()}
                  className="px-6 py-2 border border-primary text-primary font-mono text-sm hover:bg-primary/10 transition-colors uppercase"
                >
                  Retry Initialization
                </button>
              </div>
            ) : deepDive ? (
              <div className="space-y-16">
                {/* Research Content */}
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase mb-6 text-foreground flex items-center gap-3">
                    <span className="w-6 h-[2px] bg-primary" />
                    Context & Evidence
                  </h3>
                  <Markdown content={deepDive.research} />
                </div>

                {/* Theories */}
                {deepDive.theories.length > 0 && (
                  <div>
                    <h3 className="font-display text-2xl font-bold uppercase mb-8 text-foreground flex items-center gap-3">
                      <span className="w-6 h-[2px] bg-secondary" />
                      Plausible Theories
                    </h3>
                    <div className="space-y-6">
                      {deepDive.theories.map((theory, i) => (
                        <div key={i} className="border border-border/50 bg-background/50 p-6 relative group">
                          {/* Left highlight on hover */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                          
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <h4 className="text-xl font-display text-foreground font-bold uppercase">{theory.title}</h4>
                            <span className={`px-3 py-1 font-mono text-xs uppercase border whitespace-nowrap
                              ${theory.plausibility.toLowerCase().includes('plausible') || theory.plausibility.toLowerCase().includes('mainstream') ? 'text-primary border-primary/30 bg-primary/10' : 
                                theory.plausibility.toLowerCase().includes('speculative') ? 'text-secondary border-secondary/30 bg-secondary/10' : 
                                'text-destructive border-destructive/30 bg-destructive/10'}`
                            }>
                              {theory.plausibility}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {theory.explanation}
                          </p>
                          
                          {theory.evidence && (
                           <div className="mt-4 pt-4 border-t border-border/50">
                              <span className="block text-xs font-mono text-foreground/70 uppercase mb-2">Key Evidence:</span>
                              <p className="text-sm text-muted-foreground italic">"{theory.evidence}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verdict */}
                {deepDive.verdict && (
                  <div className="border border-primary/50 bg-primary/5 p-8 relative">
                    <div className="absolute -top-3 left-6 px-2 bg-card text-primary font-header text-xs font-bold uppercase tracking-[0.2em]">
                      Final Verdict
                    </div>
                    <p className="text-foreground leading-relaxed font-medium">
                      {deepDive.verdict}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* End of Dossier CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 border border-border/50 bg-[#080B12] p-8 md:p-12 relative overflow-hidden"
        >
          {/* subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h3 className="font-header text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
              End of Dossier
            </h3>
            <h4 className="font-display text-3xl md:text-4xl uppercase tracking-tighter mb-6 text-glow-cyan">
              The Truth is <span className="text-primary">Engineered</span>
            </h4>
            <p className="text-muted-foreground leading-relaxed mb-10">
              You've read the evidence. You've seen the anomalies. But who builds the infrastructure that keeps it all documented? This archive is a demonstration of the power of OperatorOS and the creative engineering of Shotgun Ninjas Productions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://operatoros.net"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-header uppercase tracking-wider text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Command className="w-4 h-4" />
                Explore OperatorOS
              </a>
              <a 
                href="https://shotgunninjas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-destructive text-destructive font-header uppercase tracking-wider text-sm hover:bg-destructive/10 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(224,7,0,0.1)] hover:shadow-[0_0_20px_rgba(224,7,0,0.2)]"
              >
                <Target className="w-4 h-4" />
                Meet the Ninjas
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
