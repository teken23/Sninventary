'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomerModal from './customer-modal';
import CustomerDetailModal from './customer-detail-modal';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  balance: number;
}

export default function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomer(customerId);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedCustomer('');
    fetchCustomers();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando clientes...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="h-5 w-5" />
          Agregar Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Saldo Pendiente</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers?.map((customer, index) => (
                <motion.tr
                  key={customer?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{customer?.name}</td>
                  <td className="px-6 py-4 text-gray-700">{customer?.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{customer?.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${(customer?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      DOP ${(customer?.balance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(customer?.id || '')}
                        className="p-2 text-[#70d6ff] hover:bg-[#70d6ff]/10 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 text-[#ff9770] hover:bg-[#ff9770]/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer?.id || '')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={handleCloseModal}
        />
      )}

      {detailModalOpen && (
        <CustomerDetailModal
          customerId={selectedCustomer}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
}
