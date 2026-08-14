"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Wallet,
} from "lucide-react";
import SearchSidebar from "./SearchSidebar";
import CartDrawer from "./CartDrawer";
import { useAuthContext } from "@/components/Users/context/AuthContext";
import { useCart } from "@/components/Users/context/CartContext";
import { menuItemApi } from "@/api/menuItem.api";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Single source of truth for drawer open/tab state — avoids the
  // two-state race between local drawerTab and context isCartOpen.
  const { isCartOpen, activeDrawerTab, openDrawer, closeDrawer, cart, wishlist } = useCart();
  const { user } = useAuthContext();
  const profileHref = user ? "/profile" : "/login";

  const cartCount = cart?.length ?? 0;
  const wishlistCount = wishlist?.length ?? 0;

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleOpenDrawer = (tab) => {
    openDrawer(tab); // atomic: sets tab + open together
    setMobileOpen(false);
  };

  // 9 nav links + logo + icons + profile button genuinely need xl (1280px)+
  // to sit comfortably on one row. Below that (mobile AND tablet / small
  // laptop) we fall back to the hamburger nav so nothing wraps or overflows.
  const [navLinks, setNavLinks] = useState([
    { name: "Home", path: "/" }
  ]);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await menuItemApi.getMenuItems({ location: 'navbar', activeOnly: true });
        if (res?.data) {
          const fetchedLinks = res.data.map(item => ({
            name: item.label,
            path: item.link
          }));
          // Ensure "Home" is always prepended if not in db, or just prepend it anyway
          // We will just use the fetched links, assuming admin adds "Home". 
          // But to be safe as per plan, prepend "Home"
          setNavLinks([{ name: "Home", path: "/" }, ...fetchedLinks.filter(l => l.path !== '/')]);
        }
      } catch (err) {
        console.error("Failed to load navbar links", err);
      }
    };
    fetchNav();
  }, []);

  return (
    <>
      <header className="isolate fixed top-3 sm:top-4 xl:top-5 left-1/2 -translate-x-1/2 z-[99999] w-[95%] sm:w-[94%] xl:w-[92%] max-w-[105rem] antialiased">
        {/* ================= DESKTOP (xl and up: 1280px+) ================= */}
        <nav
          className="hidden xl:flex items-center justify-between min-h-[4.5rem] 2xl:min-h-[4.875rem] py-2 px-4 xl:px-5 2xl:px-6 rounded-full border transition-all duration-500 bg-black/90 border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,.55)]"
        >
          <Link href="/" className="shrink-0 flex items-center pr-2">
            <img
              src="/images/logo/vl_logo.png"
              alt="Vian Luxure"
              className="h-11 2xl:h-13 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
            />
          </Link>

          <ul className="flex items-center gap-0.5 xl:gap-1 rounded-full px-1 py-1 min-w-0 shrink">
            {navLinks.map((link) => {
              const active = pathname === link.path;
              return (
                <li key={link.path} className="shrink-0">
                  <Link
                    href={link.path}
                    className={`block px-2.5 xl:px-3 2xl:px-3.5 py-2 rounded-full text-[0.90625rem] xl:text-[0.90625rem] 2xl:text-[0.9375rem] font-semibold tracking-wide transition-all whitespace-nowrap ${
                      active ? "bg-[#C9A84C] text-white shadow-sm" : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1 xl:gap-1.5 2xl:gap-2 shrink-0 pl-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 2xl:p-2.5 rounded-full text-white/90 hover:text-black hover:bg-white transition-all"
            >
              <Search size={19} strokeWidth={2.2} className="pointer-events-none" />
            </button>
            <Link
              href="/profile/wallet"
              className="p-2 2xl:p-2.5 rounded-full text-white/90 hover:text-black hover:bg-white transition-all"
            >
              <Wallet size={19} strokeWidth={2.2} className="pointer-events-none" />
            </Link>
            <button
              type="button"
              onClick={() => handleOpenDrawer("wishlist")}
              className="relative p-2 2xl:p-2.5 rounded-full text-white/90 hover:text-black hover:bg-white transition-all"
            >
              <Bookmark size={19} strokeWidth={2.2} className="pointer-events-none" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#C9A84C] text-white text-[0.625rem] font-bold leading-none pointer-events-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleOpenDrawer("cart")}
              className="relative p-2 2xl:p-2.5 rounded-full text-white/90 hover:text-black hover:bg-white transition-all"
            >
              <ShoppingCart size={19} strokeWidth={2.2} className="pointer-events-none" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#C9A84C] text-white text-[0.625rem] font-bold leading-none pointer-events-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <Link
              href={profileHref}
              className="ml-1 flex items-center gap-1.5 pl-1.5 pr-3 xl:pr-3.5 2xl:pr-4 py-1.5 rounded-full bg-[#C9A84C] text-white hover:bg-[#b8962e] transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center shrink-0">
                <User size={15} strokeWidth={2.3} />
              </span>
              <span className="text-[0.8125rem] xl:text-[0.84375rem] 2xl:text-[0.875rem] font-bold tracking-wide whitespace-nowrap">
                {user ? "Profile" : "Login"}
              </span>
            </Link>
          </div>
        </nav>

        {/* ================= MOBILE + TABLET (below xl: up to 1279px) =================
            Tablet (md/768px+) shows ALL icons directly on the navbar — only the
            link list stays collapsed into the hamburger. Phone (below md) keeps
            it tight: just search, wallet, and hamburger, to avoid crowding. */}
        <nav
          className="flex xl:hidden justify-between items-center min-h-[3.75rem] sm:min-h-[4.25rem] py-1.5 px-4 sm:px-5 rounded-full border transition-all duration-300 bg-black/90 border-white/10 backdrop-blur-2xl shadow-xl"
        >
          <Link href="/" className="shrink-0 flex items-center">
            <img
              src="/images/logo/vl_logo.png"
              alt="Vian Luxure"
              className="h-9 sm:h-10 md:h-11 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:p-2.5 text-white active:opacity-60"
            >
              <Search size={19} strokeWidth={2.2} className="pointer-events-none" />
            </button>
            <Link
              href="/profile/wallet"
              className="p-2 sm:p-2.5 text-white active:opacity-60"
            >
              <Wallet size={19} strokeWidth={2.2} className="pointer-events-none" />
            </Link>

            {/* Wishlist + Cart + Profile: hidden on phone, shown from md (tablet) up */}
            <button
              type="button"
              onClick={() => handleOpenDrawer("wishlist")}
              className="relative p-2 sm:p-2.5 text-white active:opacity-60 hidden md:inline-flex"
            >
              <Bookmark size={19} strokeWidth={2.2} className="pointer-events-none" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#C9A84C] text-white text-[0.5625rem] font-bold leading-none pointer-events-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleOpenDrawer("cart")}
              className="relative p-2 sm:p-2.5 text-white active:opacity-60 hidden md:inline-flex"
            >
              <ShoppingCart size={19} strokeWidth={2.2} className="pointer-events-none" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#C9A84C] text-white text-[0.5625rem] font-bold leading-none pointer-events-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <Link
              href={profileHref}
              className="hidden md:flex items-center gap-1.5 ml-1 pl-1 pr-3 py-1.5 rounded-full bg-[#C9A84C] text-white hover:bg-[#b8962e] transition-all"
            >
              <span className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center shrink-0">
                <User size={13} strokeWidth={2.3} />
              </span>
              <span className="text-xs font-bold tracking-wide whitespace-nowrap">
                {user ? "Profile" : "Login"}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
              className="p-2 sm:p-2.5 text-white active:opacity-60"
            >
              {mobileOpen ? <X size={22} strokeWidth={2.2} className="pointer-events-none" /> : <Menu size={22} strokeWidth={2.2} className="pointer-events-none" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden mt-3 relative z-[9999] max-h-[calc(100vh-6rem)] overflow-y-auto"
            >
              <div className="rounded-[1.5rem] border border-white/10 bg-black/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl">
                {/* Tablet: 2-column link grid so the list doesn't get too tall. Mobile: single column. */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2 text-white">
                  {navLinks.map((link) => {
                    const active = pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`text-[0.9375rem] sm:text-base font-semibold py-3 sm:py-3.5 px-3 rounded-xl transition-colors text-center sm:text-left ${
                          active ? "text-white bg-[#C9A84C]" : "text-white hover:bg-white/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Icon row only needed on phone — tablet (md+) already shows these
                    icons directly on the navbar, so no need to repeat them here. */}
                <div className="flex md:hidden gap-2 sm:gap-3 border-t border-white/10 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer("wishlist")}
                    className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] transition-colors text-white"
                  >
                    <Bookmark size={17} strokeWidth={2.2} className="pointer-events-none" />
                    <span className="text-[0.8125rem] font-semibold">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#C9A84C] text-white text-[0.625rem] font-bold leading-none pointer-events-none">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer("cart")}
                    className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] transition-colors text-white"
                  >
                    <ShoppingCart size={17} strokeWidth={2.2} className="pointer-events-none" />
                    <span className="text-[0.8125rem] font-semibold">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#C9A84C] text-white text-[0.625rem] font-bold leading-none pointer-events-none">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </button>
                  <Link
                    href={profileHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C9A84C] text-white hover:bg-[#b8962e] transition-colors"
                  >
                    <User size={17} strokeWidth={2.2} />
                    <span className="text-[0.8125rem] font-bold">
                      {user ? "Profile" : "Login"}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeDrawer}
        activeTab={activeDrawerTab}
        setActiveTab={(tab) => openDrawer(tab)}
      />

      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;