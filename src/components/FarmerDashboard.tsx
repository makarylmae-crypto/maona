import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, UNITS, STATUS_COLORS, STATUS_LABELS, type Product, type ProductCategory } from '../types';
import ProductForm from './ProductForm';

export default function FarmerDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'sales' | 'deliveries'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>({ labels: [], amounts: [], orders: [] });
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    // fetch products
    fetch('/api/farmer/products')
      .then(res => res.json())
      .then(json => setProducts(json.rows || []))
      .catch(console.error);

    // fetch orders
    fetch('/api/farmer/orders')
      .then(res => res.json())
      .then(json => setOrders(json.rows || []))
      .catch(console.error);

    // fetch sales data
    fetch('/api/farmer/sales')
      .then(res => res.json())
      .then(json => setSalesData(json || { labels: [], amounts: [], orders: [] }))
      .catch(console.error);

    // fetch assigned deliveries
    fetch('/api/farmer/deliveries')
      .then(res => res.json())
      .then(json => setDeliveries(json.rows || []))
      .catch(console.error);
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.isAvailable).length;

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="bg-[#0d0d24] border-b border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨‍🌾</span>
              <div>
                <h1 className="text-2xl font-bold text-[#e8eaf6]">
                  {state.currentUser?.farmName || 'Farmer Dashboard'}
                </h1>
                <p className="text-[#6b708d] text-sm mt-1">Welcome back, {state.currentUser?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Products', value: activeProducts, icon: '📦', color: 'border-l-[#00c853]' },
            { label: 'Total Orders', value: totalOrders, icon: '📋', color: 'border-l-[#448aff]' },
            { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: 'border-l-[#ff9100]' },
            { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: '💰', color: 'border-l-[#00e676]' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4a] border-l-4 ${stat.color} shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#00c853]/10 text-[#00e676] border border-[#00c853]/20">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#e8eaf6]">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 bg-[#0d0d24] rounded-xl p-1 border border-[#1a1a2e] shadow-lg mb-6">
          {[
            { id: 'products', label: 'My Products', icon: '📦' },
            { id: 'orders', label: `Orders ${pendingOrders > 0 ? `(${pendingOrders})` : ''}`, icon: '📋' },
            { id: 'deliveries', label: `Deliveries ${deliveries.length > 0 ? `(${deliveries.length})` : ''}`, icon: '🚚' },
            { id: 'sales', label: 'Sales Data', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00c853] text-[#0a0a1a] shadow-sm'
                  : 'text-[#6b708d] hover:text-[#a0a4b8] hover:bg-[#1a1a2e]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Here you can render Products/Orders/Deliveries/Sales using the states */}
        {/* All data is now fetched from database via API */}
      </div>
    </div>
  );
}
