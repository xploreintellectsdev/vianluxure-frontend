"use client"; // Add use client here since we are using hooks inside the layout now

import Footer from "@/components/Users/layout/Footer";
import Navbar from "@/components/Users/layout/Navbar";
import { CartProvider } from "@/components/Users/context/CartContext";
import { AuthProvider } from "@/components/Users/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Navbar already mounts the single <CartDrawer /> (it reads isCartOpen/
// activeDrawerTab/openDrawer/closeDrawer straight from CartContext itself —
// it doesn't take props). Mounting a second one here duplicated the whole
// drawer overlay in the DOM every time the cart opened, and this component
// was destructuring `setIsCartOpen` off useCart(), which CartContext never
// actually exposes (only `openDrawer`/`closeDrawer` are exported) — so that
// onClose handler was silently broken dead code. Removed both.
const LayoutContent = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default function UsersLayout({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "417830018271-36rtrccld3af0msjc9ov1f3mtc9kfbtv.apps.googleusercontent.com";
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <CartProvider>
          <LayoutContent>{children}</LayoutContent>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}