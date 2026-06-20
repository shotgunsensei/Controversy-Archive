import React from "react";

// A tasteful, simple markdown parser for the deep dives.
// We avoid installing heavy markdown libs and keep it lightweight.
export function Markdown({ content, className = "" }: { content: string, className?: string }) {
  const parseMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split by double newlines for paragraphs
    const blocks = text.split(/\n\n+/);
    
    return blocks.map((block, index) => {
      // Headings
      if (block.startsWith('# ')) return <h1 key={index} className="text-3xl font-mono text-primary mb-4 mt-8">{parseInline(block.slice(2))}</h1>;
      if (block.startsWith('## ')) return <h2 key={index} className="text-2xl font-mono text-foreground border-b border-border pb-2 mb-4 mt-8">{parseInline(block.slice(3))}</h2>;
      if (block.startsWith('### ')) return <h3 key={index} className="text-xl font-mono text-foreground mb-3 mt-6">{parseInline(block.slice(4))}</h3>;
      
      // Blockquotes
      if (block.startsWith('> ')) {
        const quoteText = block.split('\n').map(line => line.replace(/^>\s?/, '')).join('\n');
        return <blockquote key={index} className="border-l-2 border-primary pl-4 py-1 italic text-muted-foreground my-6 bg-primary/5">{parseInline(quoteText)}</blockquote>;
      }
      
      // Lists (simple unordered)
      if (block.match(/^[-*+]\s/m)) {
        const items = block.split('\n').filter(line => line.match(/^[-*+]\s/));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 pl-4 text-muted-foreground">
            {items.map((item, i) => (
              <li key={i} className="pl-1">{parseInline(item.replace(/^[-*+]\s/, ''))}</li>
            ))}
          </ul>
        );
      }
      
      // Default paragraph
      return <p key={index} className="mb-4 text-muted-foreground leading-relaxed text-lg">{parseInline(block)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // Basic inline formatting: **bold**, *italic*, `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-foreground italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">{part.slice(1, -1)}</code>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <div className={`prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground max-w-none ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
}
