"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Search,
  Play,
  BookOpen,
  Star,
  Shuffle,
  BookMarked,
} from "lucide-react";
import FloatingSearch from "@/components/floating-search";
import styled from "styled-components";

const SearchButton = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid
    color-mix(in oklab, var(--color-gray-500) 80%, transparent);
  background: rgba(107, 114, 128, 0.2);
  backdrop-filter: blur(6px);
  color: #666;
  font-size: 0.875rem;
  transition: background 0.2s ease;
  display: none;

  @media (min-width: 1024px) {
    display: block;
    padding-left: 2.5rem;
    padding-right: 1rem;
  }

  &:hover {
    background-color: color-mix(
      in oklab,
      var(--color-gray-700) 20%,
      transparent
    ) !important;
  }

  .dark & {
    background: rgba(55, 65, 81, 0.2);

    &:hover {
      background-color: color-mix(
        in oklab,
        var(--color-gray-700) 20%,
        transparent
      ) !important;
    }
  }
`;

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // close menu when tapping outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        navRef.current &&
        !navRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Anime", href: "/anime", icon: Play },
    { name: "Manga", href: "/manga", icon: BookOpen },
    { name: "Top Rated", href: "/top", icon: Star },
    { name: "Watchlist", href: "/anime/wl", icon: BookMarked },
    { name: "Random", href: "/anime/random", icon: Shuffle },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 left-0 right-0 z-30 backdrop-blur-md bg-background/80 border-b border-purple-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center gap-0">
                <span className="ml-3 text-xl font-bold bg-pink-200 bg-clip-text text-transparent">
                  Otaku
                </span>
                <span className="bg-purple-400 text-2xl font-bold bg-clip-text text-transparent">
                  X
                </span>
              </a>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div
                className="w-full relative cursor-pointer"
                onClick={() => setIsSearchOpen(true)}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-50" />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 text-gray-400 z-50 text-xs px-2 rounded border border-sidebar-border/20 bg-sidebar-foreground/5 items-center w-auto hidden lg:flex">
                  ⌘k
                </button>
                <SearchButton>Search anime, manga...</SearchButton>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center dark:text-purple-300 hover:text-purple-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 backdrop-blur-sm group">
                  {item.icon && (
                    <item.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-200">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="text-gray-300 hover:text-purple-400 p-2 rounded-lg transition-colors duration-200">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center text-gray-300 dark:text-purple-300 hover:text-purple-400 px-3 py-3 text-base font-medium transition-colors duration-200 rounded-sm hover:bg-white/5">
                  {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <FloatingSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </>
  );
}
