"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { customStyleCategoryApi } from "@/api/customStyleCategory.api";
import {
  LayoutDashboard, Layers, Palette, Scissors, Maximize,
  ChevronLeft, ChevronRight, ChevronDown, LogOut,
  ShoppingBag, Globe, Scale, Waves, Grid, Shirt,
  CircleDot, Crown, Folder, Ruler, ClipboardList, Package, MessageSquare, Settings, Wallet, Shield,
  BookOpen, Calendar, Menu, X, Building2, Type, List, Users, FileText
} from "lucide-react";

const initialMenuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Admin Users", href: "/admin/admins", icon: Shield },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Product Types", href: "/admin/product-types", icon: Layers },
  { name: "Fabric Categories", href: "/admin/fabric-categories", icon: ShoppingBag },
  { name: "Origins", href: "/admin/origins", icon: Globe },
  { name: "Weights", href: "/admin/weights", icon: Scale },
  { name: "Weaves", href: "/admin/weaves", icon: Waves },
  { name: "Patterns", href: "/admin/patterns", icon: Grid },
  { name: "Styles", href: "/admin/styles", icon: Shirt },
  { name: "Colors", href: "/admin/colors", icon: Palette },
  { name: "Fabric Master", href: "/admin/fabrics", icon: Maximize },
  { name: "Ready To Wear", href: "/admin/rtw", icon: Scissors },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Wallets", href: "/admin/wallets", icon: Wallet },
  { name: "Payment Settings", href: "/admin/payment-settings", icon: Settings },
  // ── Home Page ──
  {
    name: "Home Page",
    icon: Layers,
    children: [
      { name: "Hero Section", href: "/admin/hero", icon: Layers },
      { name: "Banners", href: "/admin/banners", icon: Layers },
      { name: "Story Sections", href: "/admin/story-sections", icon: BookOpen },
      { name: "Customer Reviews", href: "/admin/home-reviews", icon: MessageSquare },
    ],
  },
  { name: "Art of Perfect Fit", href: "/admin/art-of-perfect-fit", icon: BookOpen },
  { name: "About Page", href: "/admin/about-page", icon: BookOpen },
  
  // ── Contact Page ──
  {
    name: "Contact Page",
    icon: BookOpen,
    children: [
      { name: "Hero Section", href: "/admin/contact-page?tab=hero", icon: Layers },
      { name: "Info & Map", href: "/admin/contact-page?tab=info", icon: Globe },
      { name: "Submissions", href: "/admin/contact-page?tab=submissions", icon: MessageSquare },
    ],
  },
  // ── Site Settings ──
  {
    name: "Site Settings",
    icon: Settings,
    children: [
      { name: "Menu Manager", href: "/admin/menu", icon: List },
      { name: "Page Content", href: "/admin/page-content", icon: Layers },
      { name: "Policy Pages", href: "/admin/policy-pages", icon: FileText },
    ],
  },
  { name: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { name: "Events", href: "/admin/events", icon: Calendar },

  

  // ── Monogram Customization (Shirts) ──
  {
    name: "Monogram Settings",
    icon: Type,
    children: [
      { name: "Placements", href: "/admin/monogram/placements", icon: CircleDot },
      { name: "Colors", href: "/admin/monogram/colors", icon: Palette },
      { name: "Fonts", href: "/admin/monogram/fonts", icon: Type },
    ],
  },

  // ── Bespoke Tailoring Customizations ──
  {
    name: "Bespoke Styles",
    icon: Crown,
    children: [
      // To be populated dynamically
    ],
  },

  // ── Orders, grouped by product type ──
  {
    name: "Orders",
    icon: ClipboardList,
    children: [
      { name: "All Orders", href: "/admin/orders/all", icon: List },
      { name: "Fabric orders", href: "/admin/orders/fabric", icon: Package },
      { name: "Ready to Wear Orders", href: "/admin/orders/rtw", icon: Scissors },
      { name: "Made to Wear Orders", href: "/admin/orders/made-to-wear", icon: Shirt },
      { name: "Bespoke Orders", href: "/admin/orders/bespoke", icon: Crown },
      { name: "Corporate Orders", href: "/admin/orders/corporate", icon: Building2 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("adminUser");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        const roleStr = (user?.role || "").toLowerCase();
        if (roleStr.includes("super")) {
          setIsSuperAdmin(true);
        }
      }
    } catch (e) {
      console.error("Error reading admin role from localStorage", e);
    }

    const fetchCategories = async () => {
      try {
        const res = await customStyleCategoryApi.getAll({ activeOnly: true });
        const categories = res.data || [];
        
        const dynamicChildren = categories.map(cat => ({
          name: cat.name,
          href: `/admin/bespoke-styles/${cat.slug}`,
          icon: CircleDot
        }));

        dynamicChildren.push({
          name: "Manage Categories",
          href: "/admin/style-categories",
          icon: Settings
        });

        setMenuItems(prev => prev.map(item => {
          if (item.name === "Bespoke Styles") {
            return { ...item, children: dynamicChildren };
          }
          return item;
        }));
      } catch (err) {
        console.error("Failed to load custom style categories for sidebar", err);
      }
    };
    fetchCategories();
  }, []);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    initialMenuItems.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href) || pathname.startsWith('/admin/style-categories'))) {
        initial[item.name] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (name) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.dispatchEvent(new Event("admin-logout"));
  };

  const renderNavList = (collapsed) => (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
      {menuItems
        .filter((item) => {
          if (item.href === "/admin/admins" || item.name === "Admin Users") {
            return isSuperAdmin;
          }
          return true;
        })
        .map((item) => {
        const Icon = item.icon;

        // Group item (e.g. "Orders", "Bespoke Styles")
        if (item.children) {
          const isGroupActive = item.children.some((child) => {
            const childPath = child.href.split('?')[0];
            return pathname === childPath || pathname.startsWith(child.href);
          });
          const isExpanded = !!expandedGroups[item.name];

          if (collapsed) {
            return (
              <Link
                key={item.name}
                href={item.children[0]?.href || "#"}
                title={item.name}
                className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all ${
                  isGroupActive ? "bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white shadow-md shadow-[#C8A64D]/25" : "text-slate-600 hover:bg-stone-50 hover:text-[#C8A64D]"
                }`}
              >
                <Icon size={20} className="shrink-0" />
              </Link>
            );
          }

          return (
            <div key={item.name}>
              <button
                onClick={() => toggleGroup(item.name)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all ${
                  isGroupActive ? "bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white shadow-md shadow-[#C8A64D]/25" : "text-slate-600 hover:bg-stone-50 hover:text-[#C8A64D]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} className="shrink-0" />
                  <span className="text-sm font-bold">{item.name}</span>
                </span>
                <ChevronDown size={16} className={`shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#C8A64D]/30 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isChildActive
                            ? "bg-[#C8A64D]/15 text-[#C8A64D] font-extrabold shadow-2xs"
                            : "text-slate-500 hover:bg-stone-50 hover:text-[#C8A64D]"
                        }`}
                      >
                        <ChildIcon size={16} className="shrink-0" />
                        <span className="text-sm font-semibold">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Regular single link item
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white shadow-md shadow-[#C8A64D]/25 font-bold"
                : "text-slate-600 hover:bg-stone-50 hover:text-[#C8A64D]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span className="text-sm font-bold">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile Top Header Bar (< lg) ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2 min-h-[3.75rem] flex items-center justify-between shadow-2xs w-full shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <img src="/images/logo/vl_logo.png" alt="Vian Luxure" className="h-9 w-auto object-contain shrink-0 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
          <span className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight whitespace-nowrap">
            VIAN <span className="text-[#C8A64D]">LUXURE</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl border border-stone-200 text-slate-700 hover:text-[#C8A64D] hover:bg-stone-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ── Mobile Slide-In Menu Drawer Overlay (< lg) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative bg-white w-72 max-w-[85vw] h-full shadow-2xl border-r border-stone-200 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="px-5 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between">
              <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <img src="/images/logo/vl_logo.png" alt="Vian Luxure" className="h-11 sm:h-12 w-auto object-contain shrink-0 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
                <span className="text-lg font-serif font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  VIAN <span className="text-[#C8A64D]">LUXURE</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {renderNavList(false)}

            <div className="p-4 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Desktop Sticky Sidebar (>= lg) ── */}
      <aside
        className={`hidden lg:flex relative bg-white border-r border-stone-200 transition-all duration-300 flex-col h-screen sticky top-0 shrink-0 shadow-2xs ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-white border border-stone-200 rounded-full p-1 text-slate-500 hover:text-[#C8A64D] shadow-sm z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`px-5 pt-4 pb-2 mb-1 flex items-center ${isCollapsed ? "justify-center py-4 mb-2" : "justify-start"}`}>
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8A64D] to-[#9A7D34] flex items-center justify-center shrink-0 shadow-md shadow-[#C8A64D]/20" title="Vian Luxure Admin">
                <span className="text-white font-black text-sm">VL</span>
              </div>
            ) : (
              <>
                <img src="/images/logo/vl_logo.png" alt="Vian Luxure Admin" className="h-12 w-auto object-contain shrink-0 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all hover:scale-105" />
                <span className="text-lg font-serif font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  VIAN <span className="text-[#C8A64D]">LUXURE</span>
                </span>
              </>
            )}
          </Link>
        </div>

        {renderNavList(isCollapsed)}

        <div className="p-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Logout"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
