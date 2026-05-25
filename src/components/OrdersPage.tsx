import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_METHODS, type OrderStatus } from '../types';

interface OrdersPageProps {
  role: 'farmer' | 'resident';
}

function OrderTimeline({ statusHistory }: { statusHistory: { status: OrderStatus; timestamp: string; note?: string }[] }) {
  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStatus = statusHistory[statusHistory.length - 1]?.status || 'pending';
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="relative">
      {statusOrder.map((status, index) => {
        const historyEntry = statusHistory.find((h) => h.status === status);
        const isCompleted = !!historyEntry;
        const isCurrent = status === currentStatus;
        return (
          <div key={status} className="flex items-start gap-3 pb-3 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isCompleted ? 'bg-[#00c853] border-[#00c853]' : isCancelled && index === 0 ? 'bg-[#ff5252] border-[#ff5252]' : 'bg-[#1a1a2e] border-[#3a3a5a]'}`} />
              {index < 4 && <div className={`w-0.5 h-full ${isCompleted && !isCancelled ? 'bg-[#00c853]/40' : 'bg-[#1a1a2e]'}`} />}
            </div>
            <div className="pb-3 flex-1">
              <p className={`text-sm font-medium capitalize ${isCompleted ? 'text-[#00e676]' : isCurrent ? 'text-[#448aff]' : 'text-[#6b708d]'}`}>
                {STATUS_LABELS[status]}
                {isCurrent && !isCompleted && <span className="ml-2 inline-block w-2 h-2 bg-[#448aff] rounded-full animate-pulse" />}
              </p>
              {historyEntry && <p className="text-xs text-[#6b708d] mt-0.5">{new Date(historyEntry.timestamp).toLocaleString('en-PH')}</p>}
              {historyEntry?.note && <p className="text-xs text-[#6b708d] mt-0.5 italic">{historyEntry.note}</p>}
            </div>
          </div>
        );
      })}
      {isCancelled && currentStatus === 'cancelled' && (
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded-full bg-[#ff5252] border-2 border-[#ff5252] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#ff5252]">Cancelled</p>
            <p className="text-xs text-[#ff5252]/60 mt-0.5">{new Date(statusHistory[statusHistory.length - 1].timestamp).toLocaleString('en-PH')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage({ role }: OrdersPageProps) {
  const { updateOrderStatus, assignDelivery, updatePaymentStatus } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [showDeliveryForm, setShowDeliveryForm] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({ driverName: '', driverPhone: '', estimatedDelivery: '' });

  // fetch orders from database
  useEffect(() => {
    const endpoint = role === 'farmer' ? '/api/farmer/orders' : '/api/resident/orders';
    fetch(endpoint)
      .then(res => res.json())
      .then((data) => setOrders(data.rows || []))
      .catch(console.error);
  }, [role]);

  const handleAssignDelivery = (orderId: string) => {
    if (!deliveryForm.driverName || !deliveryForm.driverPhone) return;
    assignDelivery(orderId, {
      driverName: deliveryForm.driverName,
      driverPhone: deliveryForm.driverPhone,
      assignedAt: new Date().toISOString(),
      estimatedDelivery: deliveryForm.estimatedDelivery ? new Date(deliveryForm.estimatedDelivery).toISOString() : undefined,
    });
    setShowDeliveryForm(null);
    setDeliveryForm({ driverName: '', driverPhone: '', estimatedDelivery: '' });
  };

  const handleMarkPaid = (orderId: string) => {
    updatePaymentStatus(orderId, { method: 'cod', status: 'paid', paidAt: new Date().toISOString() });
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-lg font-semibold text-[#e8eaf6] mb-2">No orders yet</h3>
          <p className="text-[#6b708d]">{role === 'farmer' ? 'When residents place orders, they will appear here.' : 'Start shopping and your orders will appear here.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* render orders dynamically */}
        <div className="space-y-4">
          {orders
           
