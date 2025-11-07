
'use client';

import { useSession } from 'next-auth/react';
import { DollarSign, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession() || {};
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('/api/currency');
      const data = await res.json();
      setExchangeRate(data?.rate || null);
      setLastUpdated(data?.lastUpdated || '');
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger menu button for mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">USD a DOP: </span>
            <strong>{exchangeRate ? exchangeRate.toFixed(2) : '...'}</strong>
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-2 hidden md:inline">
                Actualizado: {new Date(lastUpdated).toLocaleDateString('es-DO')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-right">
            <p className="font-medium text-gray-900 hidden sm:block">{session?.user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 hidden md:block">{session?.user?.email || 'admin@sn.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
