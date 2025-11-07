'use client';

import { useEffect, useState } from 'react';
import { X, DollarSign } from 'lucide-react';

interface CustomerDetails {
  id: string;
  name: string;
  balance: number;
  orders: any[];
  invoices: any[];
  payments: any[];
}

export default function CustomerDetailModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      setCustomer(data || null);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(`/api/customers/${customerId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          notes: paymentNotes,
        }),
      });

      setPaymentAmount('');
      setPaymentNotes('');
      fetchCustomerDetails();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">{customer?.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-[#ff9770] to-[#ffd670] rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Saldo Pendiente</p>
            <p className="text-4xl font-bold">DOP ${(customer?.balance || 0).toFixed(2)}</p>
          </div>

          {(customer?.balance || 0) > 0 && (
            <form onSubmit={handlePayment} className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Pago</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff]"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:opacity-90"
              >
                Registrar Pago
              </button>
            </form>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
            <div className="space-y-2">
              {customer?.payments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay pagos registrados</p>
              ) : (
                customer?.payments?.map((payment: any) => (
                  <div key={payment?.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">DOP ${payment?.amount?.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{payment?.method} - {payment?.notes || 'Sin notas'}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(payment?.createdAt || '').toLocaleDateString('es-DO')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
