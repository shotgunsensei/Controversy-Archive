import { useState } from "react";
import { Link } from "wouter";
import { Topic } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";

export type TopicCardVariant = "grid" | "gallery";

export function TopicCard({
  topic,
  index,
  variant = "grid",
}: {
  topic: Topic;
  index: number;
  variant?: TopicCardVariant;
}) {
  if (variant === "gallery") {
    return <GalleryTopicCard topic={topic} index={index} />;
  }
  return <GridTopicCard topic={topic} index={index} />;
}

function GridTopicCard({ topic, index }: { topic: Topic; index: number }) {
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
              <ImageFallback />
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

function GalleryTopicCard({ topic, index }: { topic: Topic; index: number }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!topic.imageUrl && !imgError;
  const imageSrc = topic.imageUrl
    ? `${import.meta.env.BASE_URL}${topic.imageUrl}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link href={`/topic/${topic.slug}`} className="block h-full group">
        <div className="relative h-full aspect-[3/4] overflow-hidden border border-border bg-muted transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {/* Image fills the card */}
          {showImage ? (
            <img
              src={imageSrc}
              alt={topic.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] saturate-[0.85] transition-all duration-700 group-hover:grayscale-0 group-hover:saturate-100 group-hover:scale-105"
            />
          ) : (
            <ImageFallback large />
          )}

          {/* Bottom-up gradient for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity z-20" />

          {/* Top meta row */}
          <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between z-10">
            <span className="text-[10px] font-mono text-primary bg-background/70 backdrop-blur-sm px-2 py-1 uppercase tracking-wider border border-primary/20">
              {topic.category}
            </span>
            {topic.featured && (
              <span className="text-[10px] font-mono text-destructive bg-background/70 backdrop-blur-sm px-2 py-1 uppercase flex items-center gap-1 border border-destructive/20">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                CLASSIFIED
              </span>
            )}
          </div>

          {/* Bottom overlay content */}
          <div className="absolute bottom-0 inset-x-0 p-5 z-10">
            <h3 className="text-lg md:text-xl font-bold font-mono mb-2 group-hover:text-primary transition-colors line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {topic.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              {topic.summary}
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{topic.era || "UNKNOWN ERA"}</span>
              <span className="group-hover:text-primary transition-colors flex items-center gap-1">
                ACCESS FILE
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ImageFallback({ large = false }: { large?: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.04)_10px,rgba(245,158,11,0.04)_20px)]">
      <FileQuestion
        className={`text-muted-foreground/40 ${large ? "w-14 h-14" : "w-10 h-10"}`}
      />
    </div>
  );
}
