"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // ── FIX: isCartOpen and which tab is active are now stored together ──
  // ── so they can never update out of sync with each other.           ──
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState("cart");

  // 1. LOAD from browser cache ONLY ONCE when the app starts
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("vian_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // ── FIX: older carts saved before cartItemId existed won't have ──
        // ── it on their items — backfill one here so keys/removal work. ──
        const migratedCart = parsedCart.map((item) =>
          item.cartItemId
            ? item
            : { ...item, cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
        );
        setCart(migratedCart);
        localStorage.setItem("vian_cart", JSON.stringify(migratedCart));
      }

      const savedWishlist = localStorage.getItem("vian_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (error) {
      console.error("Failed to load local storage", error);
    }
  }, []);

  // 2. Helper function: Updates React State AND Browser Cache at the same time
  const updateAndSaveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("vian_cart", JSON.stringify(newCart));
  };

  const updateAndSaveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem("vian_wishlist", JSON.stringify(newWishlist));
  };

  // ── FIX: single entry point to open the drawer on a given tab.       ──
  // ── This is the function Navbar calls for both the cart AND wishlist ──
  // ── buttons, so there is exactly one state update, not two.          ──
  const openDrawer = (tab = "cart") => {
    setActiveDrawerTab(tab);
    setIsCartOpen(true);
  };

  const closeDrawer = () => setIsCartOpen(false);

  // --- CART FUNCTIONS ---
  // ── FIX: no more merging by product id/type. Every add becomes its  ──
  // ── own line item, each with a unique cartItemId, so adding "2m" of ──
  // ── the same fabric twice shows as two separate 2m rows instead of  ──
  // ── being combined into one 4m row.                                 ──
  const addToCart = (product) => {
    const cartItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newCart = [...cart, { ...product, cartItemId }];

    updateAndSaveCart(newCart);
    openDrawer("cart");
  };

  // ── FIX: removes by the unique cartItemId, not the shared product id, ──
  // ── so removing one line doesn't delete every line of the same fabric. ──
  const removeFromCart = (cartItemId) => {
    const newCart = cart.filter(item => item.cartItemId !== cartItemId);
    updateAndSaveCart(newCart);
  };

  const clearCart = () => updateAndSaveCart([]);

  // --- WISHLIST FUNCTIONS ---
  const toggleWishlist = (product) => {
    const exists = wishlist.find(item => item.id === product.id && item.type === product.type);
    let newWishlist;

    if (exists) {
      newWishlist = wishlist.filter(item => !(item.id === product.id && item.type === product.type));
    } else {
      newWishlist = [...wishlist, { ...product, quantity: 1 }];
    }

    updateAndSaveWishlist(newWishlist);
  };

  const removeFromWishlist = (id) => {
    const newWishlist = wishlist.filter(item => item.id !== id);
    updateAndSaveWishlist(newWishlist);
  };

  // ── FIX: moving an item from wishlist to cart now also forces the ──
  // ── drawer onto the "cart" tab, so the user sees where it landed. ──
  // ── Each move creates its own new cart line (see addToCart above), ──
  // ── even if an identical item is already sitting in the cart.      ──
  const moveToCart = (item) => {
    addToCart({ ...item, quantity: 1.4, totalPrice: item.price * 1.4 });
    removeFromWishlist(item.id);
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      wishlist, toggleWishlist, removeFromWishlist, moveToCart,
      isCartOpen, activeDrawerTab, openDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);