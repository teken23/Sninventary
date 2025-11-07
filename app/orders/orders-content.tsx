'use client';

import { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import OrderModal from './order-modal';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string };
  status: string;
  totalDOP: number;
  createdAt: string;
}

export default function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente de preparar':
        return 'bg-yellow-100 text-yellow-700';
      case 'Listo para enviar':
        return 'bg-blue-100 text-blue-700';
      case 'Enviado':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando pedidos...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="h-5 w-5" />
          Crear Pedido
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">N° Pedido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total (DOP)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders?.map((order, index) => (
                <motion.tr
                  key={order?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{order?.orderNumber}</td>
                  <td className="px-6 py-4 text-gray-700">{order?.customer?.name}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">DOP ${order?.totalDOP?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order?.status || 'Pendiente de preparar'}
                      onChange={(e) => handleStatusChange(order?.id || '', e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order?.status || '')}`}
                    >
                      <option value="Pendiente de preparar">Pendiente de preparar</option>
                      <option value="Listo para enviar">Listo para enviar</option>
                      <option value="Enviado">Enviado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order?.createdAt || '').toLocaleDateString('es-DO')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <OrderModal onClose={() => { setModalOpen(false); fetchOrders(); }} />}
    </div>
  );
}
