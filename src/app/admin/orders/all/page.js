import OrdersIndex from '@/components/Admin/orders/ordersIndex';

export const metadata = {
    title: 'Admin - All Orders | Vian Luxure',
};

export default function AllOrdersPage() {
    return (
        <OrdersIndex
            productType="non_corporate"
            title="All"
            subtitle="All customer orders (Fabric, RTW, Made-to-Wear, Bespoke), excluding Corporate."
        />
    );
}
