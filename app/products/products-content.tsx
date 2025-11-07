
'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductModal from './product-modal';
import { downloadFile } from '@/lib/s3';

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

export default function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(58.5);

  useEffect(() => {
    fetchProducts();
    fetchExchangeRate();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('/api/currency');
      const data = await res.json();
      setExchangeRate(data?.rate || 58.5);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando productos...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="h-5 w-5" />
          Agregar Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Precio (DOP)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Costo (USD)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products?.map((product, index) => (
                <motion.tr
                  key={product?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {product?.image ? (
                        <ImageCell imagePath={product.image} alt={product?.name || ''} />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sin img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product?.name}</p>
                        {product?.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product?.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    DOP ${product?.priceDOP?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span>USD ${product?.costUSD?.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">
                        ≈ DOP ${((product?.costUSD || 0) * exchangeRate)?.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      (product?.stock || 0) <= 1 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {(product?.stock || 0) <= 1 && <AlertTriangle className="h-3 w-3" />}
                      {product?.stock || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-[#70d6ff] hover:bg-[#70d6ff]/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product?.id || '')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <ProductModal
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

function ImageCell({ imagePath, alt }: { imagePath: string; alt: string }) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    async function loadImage() {
      try {
        const signedUrl = await downloadFile(imagePath || '');
        setUrl(signedUrl || '');
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }
    if (imagePath) {
      loadImage();
    }
  }, [imagePath]);

  if (!url) {
    return (
      <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="h-12 w-12 object-cover rounded-lg"
    />
  );
}
