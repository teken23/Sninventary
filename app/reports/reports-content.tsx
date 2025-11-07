'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianAxis } from 'recharts';
import { motion } from 'framer-motion';

export default function ReportsContent() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [customersDebt, setCustomersDebt] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [sales, products, debt, stock] = await Promise.all([
        fetch('/api/reports?type=sales').then(r => r.json()),
        fetch('/api/reports?type=top-products').then(r => r.json()),
        fetch('/api/reports?type=customers-debt').then(r => r.json()),
        fetch('/api/reports?type=low-stock').then(r => r.json()),
      ]);

      setSalesData(sales || []);
      setTopProducts(products || []);
      setCustomersDebt(debt || []);
      setLowStock(stock || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando reportes...</div>;
  }

  return (
    <div className="max-w-7xl space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Ventas por Día</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              tickLine={false}
            />
            <Tooltip />
            <Bar dataKey="total" fill="#70d6ff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 10 Productos Más Vendidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cantidad Vendida</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ingresos (DOP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts?.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{product?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{product?.quantity}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">DOP ${product?.revenue?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Clientes con Deudas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Saldo Pendiente (DOP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customersDebt?.map((customer) => (
                <tr key={customer?.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{customer?.name}</td>
                  <td className="px-4 py-3 font-medium text-red-600">DOP ${customer?.balance?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Productos con Stock Bajo</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lowStock?.map((product) => (
                <tr key={product?.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{product?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{product?.category}</td>
                  <td className="px-4 py-3 font-medium text-red-600">{product?.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
