import OrdersIndex from '@/components/Admin/orders/ordersIndex';

export const metadata = {
    title: 'Admin - Fabric Orders | Vian Luxure',
};

export default function FabricOrdersPage() {
    return (
        <OrdersIndex
            productType="fabric"
            title="Fabric"
            subtitle="Orders containing fabric-by-the-meter line items."
        />
    );
}
