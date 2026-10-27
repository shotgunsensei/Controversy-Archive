import { ExternalLink, Lock, Target, Command } from "lucide-react";
import { Link } from "wouter";

const STUDIO_URL = "https://shotgunninjas.com";
const OPERATOR_OS_URL = "https://operatoros.net";

export function SiteFooter() {
  return (
    <footer className="archive-footer border-t border-border/50 bg-[#080B12] mt-24 relative overflow-hidden">
      {/* Background glow effects matching Operator OS vibe */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16 border-b border-border/30 pb-16">
          {/* Brand Col */}
          <div className="lg:pr-8">
            <h4 className="font-header text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary animate-pulse" />
              Public research archive
            </h4>
            <div className="font-display text-2xl tracking-tighter uppercase mb-4 text-glow-cyan">
              Source<span className="text-primary">_</span>Truth
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-mono">
              Explore unusual events and disputed accounts. Compare explanations and verify the underlying sources.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary border border-primary/20 px-2 py-1 bg-primary/10">OPEN EXPLORATION</span>
              <span className="text-[10px] font-mono text-muted-foreground border border-border px-2 py-1">VERIFY SOURCES</span>
            </div>
          </div>
          
          {/* Operator OS Col */}
          <div className="bg-card/30 border border-border/50 p-6 relative group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="font-header text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <Command className="w-3 h-3 text-secondary" />
              Infrastructure By
            </h4>
            <a
              href={OPERATOR_OS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-display text-xl font-bold uppercase mb-2 text-foreground hover:text-primary transition-colors text-glow-cyan"
            >
              OperatorOS <ExternalLink className="inline-block w-4 h-4 ml-1 mb-1 opacity-50" />
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              The operations platform connected to the Shotgun Ninjas ecosystem.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-mono text-muted-foreground/70 border border-border/50 px-2 py-1">TradeFlowKit</span>
              <span className="text-[10px] font-mono text-muted-foreground/70 border border-border/50 px-2 py-1">PulseDesk</span>
              <span className="text-[10px] font-mono text-muted-foreground/70 border border-border/50 px-2 py-1">TechDeck</span>
            </div>
          </div>

          {/* Shotgun Ninjas Col */}
          <div className="bg-card/30 border border-border/50 p-6 relative group hover:border-destructive/30 transition-colors">
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-destructive/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="font-header text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <Target className="w-3 h-3 text-destructive" />
              Declassified By
            </h4>
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-header text-xl font-bold uppercase tracking-tight mb-2 text-foreground hover:text-destructive transition-colors text-glow-red"
            >
              Shotgun Ninjas <ExternalLink className="inline-block w-4 h-4 ml-1 mb-1 opacity-50" />
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Own the Proof. Own the Automation. Own the Machine. The production studio behind the curtain.
            </p>
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase text-destructive hover:text-destructive/80 transition-colors"
            >
              Visit The Studio <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground/80 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Shotgun Ninjas Productions. Research, with context.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground/70 hover:text-primary transition-colors"
            >
              <Lock className="w-3 h-3" />
              Editorial access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
