import { useState } from "react";
import { Link } from "wouter";
import { Topic } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";

export function TopicCard({ topic, index }: { topic: Topic; index: number }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!topic.imageUrl && !imgError;
  const imageSrc = topic.imageUrl
    ? `${import.meta.env.BASE_URL}${topic.imageUrl}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/topic/${topic.slug}`} className="block h-full group">
        <div className="flex flex-col h-full border border-border bg-card relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          {/* Top corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />

          {/* Image banner */}
          <div className="relative aspect-[16/9] overflow-hidden bg-muted border-b border-border">
            {showImage ? (
              <img
                src={imageSrc}
                alt={topic.title}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover grayscale-[0.2] saturate-[0.9] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.04)_10px,rgba(245,158,11,0.04)_20px)]">
                <FileQuestion className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )}
            {/* Gradient for legibility / mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          </div>

          <div className="flex flex-col flex-grow p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 uppercase tracking-wider">
                {topic.category}
              </span>
              {topic.featured && (
                <span className="text-xs font-mono text-destructive flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  CLASSIFIED
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold font-mono mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {topic.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
              {topic.summary}
            </p>

            <div className="mt-auto pt-4 border-t border-border border-dashed flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>{topic.era || "UNKNOWN ERA"}</span>
              <span className="group-hover:text-primary transition-colors flex items-center gap-1">
                ACCESS FILE <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
