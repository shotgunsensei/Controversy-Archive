import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Decorative scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      <div className="relative z-10 max-w-md">
        <AlertTriangle className="w-24 h-24 text-destructive mx-auto mb-8 animate-pulse" />
        <h1 className="text-8xl font-mono font-bold text-foreground mb-4 glitch-hover">404</h1>
        <h2 className="text-xl font-mono text-primary uppercase tracking-widest mb-6">File Redacted</h2>
        <p className="text-muted-foreground mb-12">
          The requested record has been expunged from the archive. Your access attempt has been logged.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary font-mono text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300">
          Return to Safe Zone
        </Link>
        <p className="mt-12 font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
          A project by{" "}
          <a
            href="https://www.shotgunninjas.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline underline-offset-4"
          >
            Shotgun Ninjas Productions
          </a>
        </p>
      </div>
    </div>
  );
}
