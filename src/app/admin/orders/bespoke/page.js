import OrdersIndex from '@/components/Admin/orders/ordersIndex';

export const metadata = {
    title: 'Admin - Bespoke Orders | Vian Luxure',
};

export default function BespokeOrdersPage() {
    return (
        <OrdersIndex
            productType="bespoke"
            title="Bespoke"
            subtitle="Orders containing fully bespoke tailoring line items."
        />
    );
}
