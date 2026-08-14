import OrdersIndex from '@/components/Admin/orders/ordersIndex';

export const metadata = {
    title: 'Admin - Made to Wear Orders | Vian Luxure',
};

export default function MadeToWearOrdersPage() {
    return (
        <OrdersIndex
            productType="made-to-wear"
            title="Made to Wear"
            subtitle="Orders containing made-to-wear line items."
        />
    );
}
