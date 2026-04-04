import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ShoppingBagIcon, 
  UserIcon, 
  Bars3BottomRightIcon,
  XMarkIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
  }, [mobileMenuOpen]);

  // Handle transparent to dark background transition
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "The Archive", path: "/" },
    { name: "Ornaments", path: "/products" },
    { name: "Concierge", path: "/concierge" },
    { name: "Our Story", path: "/about" },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-[120] transition-all duration-700 ${
          isScrolled || mobileMenuOpen
            ? "bg-[#0A0A0A]/90 backdrop-blur-2xl py-4 border-b border-white/5" 
            : "bg-transparent py-8"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex items-center justify-between">
            
            {/* 1. BRAND LOGO */}
            <NavLink 
              to="/" 
              className="relative z-[130] group" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl md:text-2xl font-serif tracking-tighter text-white">
                THE <span className="italic text-amber-500 font-light group-hover:tracking-widest transition-all duration-500">VAULT</span>
              </span>
            </NavLink>

            {/* 2. DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-12">
              {menuItems.map((item) => (
                <NavLink 
                  key={item.name} 
                  to={item.path} 
                  className={({ isActive }) => `
                    relative py-1 transition-all duration-500 uppercase tracking-[0.3em] text-[10px] font-bold
                    ${isActive ? "text-amber-500" : "text-white/70 hover:text-white"}
                  `}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* 3. ACTION ICONS */}
            <div className="flex items-center gap-4 md:gap-8 relative z-[130]">
              <NavLink to="/account" className="hidden sm:block hover:text-amber-500 transition-colors">
                <UserIcon className="w-5 h-5 stroke-[1.5]" />
              </NavLink>

              <NavLink to="/cart" className="relative group p-2">
                <ShoppingBagIcon className="w-6 h-6 text-white group-hover:text-amber-500 transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#0A0A0A]" />
              </NavLink>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2 text-white hover:text-amber-500 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-7 h-7" />
                ) : (
                  <Bars3BottomRightIcon className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 4. CINEMATIC MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#0A0A0A] z-[110] lg:hidden flex flex-col justify-center px-10"
          >
            {/* Artistic Background Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-serif text-white/[0.02] select-none pointer-events-none italic">
              Archive
            </div>

            <div className="relative z-10 space-y-10">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.6em] mb-4"
              >
                Navigation
              </motion.p>
              
              {menuItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <NavLink 
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl font-serif text-white hover:italic hover:text-amber-200 transition-all block tracking-tighter"
                  >
                    {item.name}
                  </NavLink>
                </motion.div>
              ))}
            </div>

            {/* Mobile Footer Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-24 pt-10 border-t border-white/5 flex flex-col gap-6"
            >
              <div className="flex gap-8">
                <NavLink to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                   <UserIcon className="w-4 h-4" /> Account
                </NavLink>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                   <SparklesIcon className="w-4 h-4 text-amber-500/50" /> Vault 2026
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;