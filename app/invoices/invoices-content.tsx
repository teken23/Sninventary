'use client';

import { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import InvoiceModal from './invoice-modal';
import jsPDF from 'jspdf';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: { name: string };
  totalDOP: number;
  paymentMethod: string;
  paidAmount: number;
  balanceDue: number;
  createdAt: string;
  order: {
    items: Array<{
      product: { name: string };
      quantity: number;
      priceDOP: number;
    }>;
  };
}

export default function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('S&N', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Factura: ${invoice?.invoiceNumber}`, 20, 40);
    doc.text(`Cliente: ${invoice?.customer?.name}`, 20, 50);
    doc.text(`Fecha: ${new Date(invoice?.createdAt || '').toLocaleDateString('es-DO')}`, 20, 60);
    
    doc.setFontSize(10);
    let y = 80;
    doc.text('Producto', 20, y);
    doc.text('Cant.', 120, y);
    doc.text('Precio', 150, y);
    doc.text('Total', 180, y);
    
    y += 10;
    invoice?.order?.items?.forEach(item => {
      doc.text(item?.product?.name || '', 20, y);
      doc.text(item?.quantity?.toString() || '', 120, y);
      doc.text(`$${item?.priceDOP?.toFixed(2)}`, 150, y);
      doc.text(`$${((item?.quantity || 0) * (item?.priceDOP || 0))?.toFixed(2)}`, 180, y);
      y += 8;
    });
    
    y += 10;
    doc.setFontSize(12);
    doc.text(`Total: DOP $${invoice?.totalDOP?.toFixed(2)}`, 150, y);
    doc.text(`Pagado: DOP $${invoice?.paidAmount?.toFixed(2)}`, 150, y + 10);
    doc.text(`Pendiente: DOP $${invoice?.balanceDue?.toFixed(2)}`, 150, y + 20);
    
    doc.save(`factura-${invoice?.invoiceNumber}.pdf`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando facturas...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 shadow-md"
        >
          <Plus className="h-5 w-5" />
          Nueva Factura
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">N° Factura</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Método</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pendiente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices?.map((invoice, index) => (
                <motion.tr
                  key={invoice?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice?.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-700">{invoice?.customer?.name}</td>
                  <td className="px-6 py-4 font-medium">DOP ${invoice?.totalDOP?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{invoice?.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${(invoice?.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      DOP ${invoice?.balanceDue?.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invoice?.createdAt || '').toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => generatePDF(invoice)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#70d6ff] text-white rounded-lg hover:opacity-90"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <InvoiceModal onClose={() => { setModalOpen(false); fetchInvoices(); }} />}
    </div>
  );
}
