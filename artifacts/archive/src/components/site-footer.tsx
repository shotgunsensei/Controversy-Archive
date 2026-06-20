import { ExternalLink } from "lucide-react";

const STUDIO_URL = "https://www.shotgunninjas.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-24">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-md">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              A Project By
            </p>
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono font-bold text-lg tracking-tight uppercase text-foreground hover:text-primary transition-colors"
            >
              Shotgun Ninjas
              <span className="text-primary">Productions</span>
              <ExternalLink className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              A SaaS &amp; music production studio. This archive is one of its
              experiments — explore the rest of the lab at{" "}
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                shotgunninjas.com
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background/50 font-mono text-xs uppercase tracking-widest text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Visit the Studio
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="font-mono text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} Shotgun Ninjas Productions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
