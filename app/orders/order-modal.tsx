'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  priceDOP: number;
  stock: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

export default function OrderModal({ onClose }: { onClose: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      newItems[index] = { ...newItems[index], productId: value as string };
    } else {
      newItems[index] = { ...newItems[index], quantity: parseInt(value as string) || 1 };
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    let total = 0;
    items?.forEach(item => {
      const product = products?.find(p => p?.id === item?.productId);
      if (product) {
        total += (product?.priceDOP || 0) * (item?.quantity || 0);
      }
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || items.length === 0) {
      alert('Por favor selecciona un cliente y agrega al menos un producto');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          items: items.filter(item => item?.productId && item?.quantity > 0)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error?.error || 'Error al crear el pedido');
        setLoading(false);
        return;
      }

      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear el pedido');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Crear Pedido</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
              required
            >
              <option value="">Seleccionar cliente</option>
              {customers?.map(customer => (
                <option key={customer?.id} value={customer?.id || ''}>
                  {customer?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-gray-700">Productos *</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-[#70d6ff] text-white rounded-lg hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </button>
            </div>

            <div className="space-y-3">
              {items?.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <select
                    value={item?.productId || ''}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products?.map(product => (
                      <option 
                        key={product?.id} 
                        value={product?.id || ''}
                        disabled={(product?.stock || 0) <= 0}
                      >
                        {product?.name} - DOP ${product?.priceDOP?.toFixed(2)} (Stock: {product?.stock})
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    value={item?.quantity || 1}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>DOP ${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Pedido'}
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
