'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string };
  totalDOP: number;
}

export default function InvoiceModal({ onClose }: { onClose: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder,
          paymentMethod,
          paidAmount: parseFloat(paidAmount) || undefined,
        }),
      });

      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrderData = orders?.find(o => o?.id === selectedOrder);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Crear Factura</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pedido *</label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff]"
              required
            >
              <option value="">Seleccionar pedido</option>
              {orders?.map(order => (
                <option key={order?.id} value={order?.id || ''}>
                  {order?.orderNumber} - {order?.customer?.name} - DOP ${order?.totalDOP?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedOrderData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total del pedido</p>
              <p className="text-2xl font-bold text-gray-900">DOP ${selectedOrderData?.totalDOP?.toFixed(2)}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff]"
              required
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Pagado (Dejar vacío para pago completo)
            </label>
            <input
              type="number"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff]"
              placeholder={selectedOrderData ? selectedOrderData?.totalDOP?.toString() : '0.00'}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Factura'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
