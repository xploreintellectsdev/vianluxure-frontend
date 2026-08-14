import OrdersIndex from '@/components/Admin/orders/ordersIndex';

export const metadata = {
    title: 'Admin - Ready to Wear Orders | Vian Luxure',
};

export default function RtwOrdersPage() {
    return (
        <OrdersIndex
            productType="rtw"
            title="Ready to Wear"
            subtitle="Orders containing ready-to-wear line items."
        />
    );
}
