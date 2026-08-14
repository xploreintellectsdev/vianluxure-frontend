import BannersIndex from '@/components/Admin/banners/BannersIndex';

export const metadata = {
  title: 'Banners - Admin Dashboard',
  description: 'Manage home page promotional banners',
};

export default function BannersAdminPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <BannersIndex />
      </div>
    </div>
  );
}
