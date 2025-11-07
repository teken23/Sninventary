
'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  priceDOP: number;
  costUSD: number;
  stock: number;
}

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'cremas corporales',
    priceDOP: '',
    costUSD: '',
    stock: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product?.name || '',
        description: product?.description || '',
        category: product?.category || 'cremas corporales',
        priceDOP: product?.priceDOP?.toString() || '',
        costUSD: product?.costUSD?.toString() || '',
        stock: product?.stock?.toString() || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData?.name || '');
      formDataToSend.append('description', formData?.description || '');
      formDataToSend.append('category', formData?.category || '');
      formDataToSend.append('priceDOP', formData?.priceDOP || '0');
      formDataToSend.append('costUSD', formData?.costUSD || '0');
      formDataToSend.append('stock', formData?.stock || '0');

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (product?.id) {
        formDataToSend.append('existingImage', product?.image || '');
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData?.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={formData?.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#70d6ff] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target?.files?.[0] || null)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">PNG, JPG o JPEG (max 5MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              value={formData?.category || 'cremas corporales'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
              required
            >
              <option value="cremas corporales">Cremas Corporales</option>
              <option value="jabones de baño">Jabones de Baño</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio Venta (DOP) *</label>
              <input
                type="number"
                step="0.01"
                value={formData?.priceDOP || ''}
                onChange={(e) => setFormData({ ...formData, priceDOP: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Costo (USD) *</label>
              <input
                type="number"
                step="0.01"
                value={formData?.costUSD || ''}
                onChange={(e) => setFormData({ ...formData, costUSD: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Inicial *</label>
            <input
              type="number"
              value={formData?.stock || ''}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70d6ff] focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
