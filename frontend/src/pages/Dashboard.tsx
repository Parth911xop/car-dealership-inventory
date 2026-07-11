import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehiclesApi } from '../api';
import type { Vehicle, SearchFilters } from '../types';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';
import type { ToastMessage } from '../components/Toast';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getAll();
      setVehicles(res.data);
    } catch {
      addToast('error', 'Failed to load vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await vehiclesApi.search(filters);
      setVehicles(res.data);
    } catch {
      addToast('error', 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePurchase = async (id: string) => {
    setPurchasingId(id);
    try {
      await vehiclesApi.purchase(id, 1);
      setVehicles(prev =>
        prev.map(v => v.id === id ? { ...v, quantity: v.quantity - 1 } : v)
      );
      addToast('success', 'Vehicle purchased successfully! 🎉');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Purchase failed.';
      addToast('error', msg);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🚘 Vehicle Inventory</h1>
            <p className="page-subtitle">
              {isLoading ? 'Loading...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isSearching} />

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading inventory...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>{hasSearched ? 'No vehicles match your search' : 'No vehicles in inventory'}</h3>
            <p>
              {hasSearched
                ? 'Try adjusting your filters.'
                : isAdmin
                ? 'Go to Admin Panel to add vehicles.'
                : 'Check back later for new arrivals.'}
            </p>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={false}
                onPurchase={handlePurchase}
                isPurchasing={purchasingId === v.id}
              />
            ))}
          </div>
        )}

        <div style={{ height: 60 }} />
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
