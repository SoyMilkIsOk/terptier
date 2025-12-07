"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";

export default function NavbarSearch({
  mobile = false,
  isOpen: externalIsOpen,
  onClose,
}: {
  mobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  // Internal state for desktop expansion
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isExpanded = mobile ? externalIsOpen : internalExpanded;

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  
  // Click outside to close (Desktop only)
  useEffect(() => {
    if (mobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (internalExpanded && query === "") {
            setInternalExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [internalExpanded, query, mobile]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    // Close search bar
    if (mobile && onClose) {
        onClose();
    } else {
        setInternalExpanded(false);
    }
    
    // Redirect
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setQuery(""); // Reset query? Maybe better to keep it? Requirements didn't specify. Clearing it is safer for "global" feel.
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (mobile && onClose) onClose();
      else setInternalExpanded(false);
    }
  };

  // --- Mobile Render ---
  // On mobile, this component renders just the expanded search BAR. 
  // The toggle button is separate in Navbar.
  if (mobile) {
    if (!isExpanded) return null;
    return (
        <form 
            onSubmit={handleSearch}
            className="w-full flex items-center px-4 py-3 bg-white/10 backdrop-blur-sm border-t border-white/10"
        >
            <div className="relative w-full flex items-center">
                 <Search className="absolute left-3 w-4 h-4 text-green-100" />
                 <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search producers & strains..."
                    className="w-full bg-white/10 text-white placeholder-green-100/70 rounded-xl py-2 pl-9 pr-10 focus:outline-none focus:bg-white/20 transition-all border border-transparent focus:border-white/20"
                 />
                 <button 
                    type="submit"
                    className="absolute right-2 p-1 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors"
                >
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                 </button>
            </div>
        </form>
    );
  }

  // --- Desktop Render ---
  return (
    <div ref={containerRef} className="relative flex items-center ml-2">
      <AnimatePresence initial={false}>
        {!isExpanded ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setInternalExpanded(true)}
            className="flex items-center space-x-2 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all"
          >
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">Search</span>
          </motion.button>
        ) : (
          <motion.form
            inherit={false}
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onSubmit={handleSearch}
            className="relative flex items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
          >
             <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full bg-transparent text-white placeholder-white/60 px-4 py-2 pr-10 focus:outline-none text-sm"
             />
             <div className="absolute right-1 flex items-center">
                 {query ? (
                     <button
                        type="submit"
                        className="p-1 hover:bg-green-500 rounded-lg text-white/80 hover:text-white transition-colors"
                     >
                         <ArrowRight className="w-4 h-4 stroke-[3]" />
                     </button>
                 ): (
                     <button
                        type="button"
                        onClick={() => setInternalExpanded(false)}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-white transition-colors"
                     >
                         <X className="w-4 h-4" />
                     </button>
                 )}
             </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
