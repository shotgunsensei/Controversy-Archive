import { useState, useMemo } from "react";
import { Link } from "wouter";
import { 
  useListTopics, 
  useListFeaturedTopics, 
  useListCategories, 
  useGetArchiveStats,
  getListTopicsQueryKey,
  getListFeaturedTopicsQueryKey
} from "@workspace/api-client-react";
import { TopicCard } from "@/components/topic-card";
import { SiteFooter } from "@/components/site-footer";
import { Search, Filter, ShieldAlert, Database, Fingerprint, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming we might need to create this

export default function Home() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<'title' | 'category' | 'recent' | undefined>();

  const { data: stats } = useGetArchiveStats();
  const { data: categories } = useListCategories();
  
  // If search or category is active, we don't show featured topics separately
  const isFiltering = !!debouncedSearch || !!category;
  
  const { data: featuredTopics, isLoading: loadingFeatured } = useListFeaturedTopics({
    query: { enabled: !isFiltering, queryKey: getListFeaturedTopicsQueryKey() }
  });
  
  const { data: allTopics, isLoading: loadingAll } = useListTopics(
    { search: debouncedSearch, category, sort },
    { query: { queryKey: getListTopicsQueryKey({ search: debouncedSearch, category, sort }) } }
  );

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20">
      {/* Decorative scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="text-primary w-6 h-6" />
            <h1 className="font-mono font-bold text-lg tracking-tight uppercase">
              <span className="text-primary">Source</span>_Truth
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <a
              href="https://www.shotgunninjas.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              SHOTGUN NINJAS<span className="text-primary">PRODUCTIONS</span>
            </a>
            <span className="hidden sm:inline text-border">|</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-primary" />
              STATUS: SECURE
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12">
        {/* Hero Section */}
        <div className="max-w-4xl mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 text-xs font-mono mb-6 uppercase"
          >
            <ShieldAlert className="w-3 h-3" />
            Declassified Archive Level 4
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-mono uppercase font-bold leading-none mb-6"
          >
            Destination <span className="text-primary glitch-hover inline-block">Mystery</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            A searchable dossier of the internet's most hotly-debated anomalies, lost histories, and enduring conspiracies. Step carefully.
          </motion.p>

          {/* Stats bar */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6 mt-8 p-4 border border-border bg-card/30"
            >
              <div className="flex flex-col">
                <span className="text-xs font-mono text-muted-foreground mb-1">TOTAL ENTRIES</span>
                <span className="text-2xl font-mono text-foreground">{stats.totalTopics}</span>
              </div>
              <div className="w-px bg-border hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-xs font-mono text-muted-foreground mb-1">CATEGORIES</span>
                <span className="text-2xl font-mono text-foreground">{stats.totalCategories}</span>
              </div>
              <div className="w-px bg-border hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-xs font-mono text-muted-foreground mb-1">AI DEEP DIVES</span>
                <span className="text-2xl font-mono text-primary">{stats.deepDivesGenerated}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-20 z-30 bg-background/90 backdrop-blur-md py-4 border-y border-border mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="SEARCH THE ARCHIVE..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input/50 border border-border text-foreground px-10 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar items-center">
            <button
              onClick={() => setCategory(undefined)}
              className={`px-4 py-2 font-mono text-xs whitespace-nowrap border transition-colors ${!category ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
            >
              ALL FILES
            </button>
            {categories?.map(c => (
              <button
                key={c.category}
                onClick={() => setCategory(c.category)}
                className={`px-4 py-2 font-mono text-xs whitespace-nowrap border transition-colors flex items-center gap-2 ${category === c.category ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
              >
                {c.category.toUpperCase()} 
                <span className="opacity-50">[{c.count}]</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!isFiltering ? (
            <motion.div
              key="featured"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-16">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Database className="w-5 h-5" />
                  <h3 className="font-mono text-xl uppercase font-bold tracking-tight">Priority Dossiers</h3>
                </div>
                {loadingFeatured ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-card animate-pulse border border-border" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredTopics?.map((topic, i) => (
                      <TopicCard key={topic.id} topic={topic} index={i} />
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-6 text-foreground">
                  <Filter className="w-5 h-5" />
                  <h3 className="font-mono text-xl uppercase font-bold tracking-tight">Recent Additions</h3>
                </div>
                {loadingAll ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-card animate-pulse border border-border" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allTopics?.slice(0, 9).map((topic, i) => (
                      <TopicCard key={topic.id} topic={topic} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="filtered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-xl uppercase font-bold tracking-tight text-primary">
                  Search Results
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {allTopics?.length || 0} MATCHES FOUND
                </span>
              </div>
              
              {loadingAll ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-64 bg-card animate-pulse border border-border" />)}
                </div>
              ) : allTopics?.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border bg-card/30">
                  <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="text-xl font-mono mb-2">NO RECORDS FOUND</h4>
                  <p className="text-muted-foreground font-mono text-sm">The archive contains no matches for your query. The truth may lie elsewhere.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTopics?.map((topic, i) => (
                    <TopicCard key={topic.id} topic={topic} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}
