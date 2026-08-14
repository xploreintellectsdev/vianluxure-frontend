import MenuManagerIndex from "@/components/Admin/menu/MenuManagerIndex";

export const metadata = {
  title: "Menu Manager - Vian Luxure Admin",
  description: "Manage navbar and footer links",
};

export default function MenuManagerPage() {
  return (
    <div className="max-w-[75rem] mx-auto p-6 lg:p-8 min-h-[calc(100vh-64px)]">
      <MenuManagerIndex />
    </div>
  );
}
