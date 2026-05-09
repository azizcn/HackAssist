"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Zap,
  BookOpen,
  Rocket,
  Languages,
  Sun,
  Moon,
  Library,
  Blocks,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const {
    selectedLanguage,
    languageLabel,
    resetAll,
    theme,
    toggleTheme,
    locale,
    toggleLocale,
    t,
  } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "🥷 Dojo", href: "/dojo", icon: Blocks, show: true },
    { label: t("nav.blockchain101") || "Blockchain 101", href: "/blockchain101", icon: Library, show: true },
    { label: t("nav.builder") || "Builder", href: "/builder", icon: Blocks, show: true },
    { label: t("nav.learningHub"), href: "/learn", icon: BookOpen, show: !!selectedLanguage },
    { label: t("nav.colosseumCopilot"), href: "/copilot", icon: Rocket, show: !!selectedLanguage },
  ];

  const handleResetLanguage = () => {
    resetAll();
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || pathname !== "/"
          ? "bg-nav-bg backdrop-blur-xl border-b border-card-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={selectedLanguage ? "/learn" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center">
              <Zap size={18} className="text-background" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              {t("nav.brand")}
              <span className="text-neon-green">{t("nav.brandAccent")}</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((l) => l.show)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    pathname === link.href
                      ? "text-neon-green bg-neon-green/10"
                      : "text-muted hover:text-neon-green hover:bg-surface"
                  }`}
                >
                  <link.icon size={15} />
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface border border-card-border text-muted hover:text-neon-yellow transition-colors"
              title={theme === "dark" ? t("nav.theme.light") : t("nav.theme.dark")}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            {/* Locale toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLocale}
              className="px-3 py-2 rounded-lg bg-surface border border-card-border text-xs font-bold text-muted hover:text-neon-purple transition-colors flex items-center gap-1.5"
            >
              <Languages size={14} />
              {locale === "en" ? "TR" : "EN"}
            </motion.button>

            {/* Language badge */}
            {selectedLanguage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-medium"
              >
                {languageLabel}
              </motion.div>
            )}

            {selectedLanguage && (
              <button
                onClick={handleResetLanguage}
                className="px-3 py-1.5 text-xs text-muted-dim hover:text-foreground transition-colors rounded-lg border border-card-border hover:border-muted"
              >
                {t("nav.changeLanguage")}
              </button>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-neon-yellow transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleLocale}
              className="px-2 py-1 text-xs font-bold text-muted hover:text-neon-purple transition-colors"
            >
              {locale === "en" ? "TR" : "EN"}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 text-muted hover:text-foreground"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-nav-bg backdrop-blur-xl border-b border-card-border"
          >
            <div className="px-4 py-4 space-y-1">
              {selectedLanguage && (
                <div className="flex items-center gap-2 px-4 py-2 mb-2">
                  <Languages size={14} className="text-neon-purple" />
                  <span className="text-sm text-neon-purple font-medium">{languageLabel}</span>
                </div>
              )}

              {navLinks
                .filter((l) => l.show)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      pathname === link.href
                        ? "text-neon-green bg-neon-green/10"
                        : "text-foreground/80 hover:text-neon-green hover:bg-surface"
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}

              {selectedLanguage && (
                <button
                  onClick={() => {
                    handleResetLanguage();
                    setIsMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-muted-dim hover:text-foreground rounded-lg transition-colors text-sm"
                >
                  {t("nav.changeLanguage")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
