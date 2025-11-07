
'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Users, Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  pendingOrders: number;
  customersWithDebt: number;
  totalDebt: number;
  lowStockProducts: number;
  todaySales: number;
  monthSales: number;
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Pedidos Pendientes',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'from-[#70d6ff] to-[#ff70a6]',
      bgColor: 'bg-[#70d6ff]/10',
    },
    {
      title: 'Clientes con Deudas',
      value: stats?.customersWithDebt || 0,
      subtitle: `DOP $${(stats?.totalDebt || 0).toFixed(2)}`,
      icon: Users,
      color: 'from-[#ff9770] to-[#ffd670]',
      bgColor: 'bg-[#ff9770]/10',
    },
    {
      title: 'Productos Stock Bajo',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'from-[#ef4444] to-[#f97316]',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Ventas de Hoy',
      value: `DOP $${(stats?.todaySales || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-[#10b981] to-[#e9ff70]',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ventas del Mes',
      value: `DOP $${(stats?.monthSales || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-[#e9ff70] to-[#ffd670]',
      bgColor: 'bg-[#e9ff70]/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards?.map((card, index) => {
          const Icon = card?.icon;
          return (
            <motion.div
              key={card?.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${card?.bgColor} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{card?.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card?.value}</p>
                  {card?.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={`bg-gradient-to-br ${card?.color} p-3 rounded-xl`}>
                  {Icon && <Icon className="h-6 w-6 text-white" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
