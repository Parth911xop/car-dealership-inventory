import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { vehiclesApi } from '../api';
import type { Vehicle, SearchFilters } from '../types';
import VehicleCard, { getCatColor } from '../components/VehicleCard';
import Toast, { type ToastMessage } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['SUV', 'Sedan', 'Hatchback', 'Sports', 'Electric', 'Truck', 'Minivan', 'Convertible'];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Sidebar filter state
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res = await vehiclesApi.getAll();
      setVehicles(res.data);
    } catch {
      addToast('error', 'Failed to load vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    const filters: SearchFilters = {};
    if (filterMake.trim()) filters.make = filterMake.trim();
    if (filterModel.trim()) filters.model = filterModel.trim();
    if (filterCategory) filters.category = filterCategory;
    if (filterMinPrice) filters.minPrice = parseFloat(filterMinPrice);
    if (filterMaxPrice) filters.maxPrice = parseFloat(filterMaxPrice);
    try {
      const res = await vehiclesApi.search(filters);
      setVehicles(res.data);
    } catch {
      addToast('error', 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFilterMake('');
    setFilterModel('');
    setFilterCategory('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setHasSearched(false);
    fetchAll();
  };

  const handlePurchase = async (id: string) => {
    setPurchasingId(id);
    try {
      await vehiclesApi.purchase(id, 1);
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, quantity: v.quantity - 1 } : v));
      addToast('success', 'Purchase successful! 🎉');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Purchase failed.';
      addToast('error', msg);
    } finally {
      setPurchasingId(null);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: vehicles.length,
    brands: new Set(vehicles.map(v => v.make)).size,
    categories: new Set(vehicles.map(v => v.category)).size,
    inStock: vehicles.filter(v => v.quantity > 0).length,
  }), [vehicles]);

  const STATS = [
    { label: 'Vehicles', value: stats.total, icon: '🚗', color: '#f97316', r: 249, g: 115, b: 22 },
    { label: 'Brands', value: stats.brands, icon: '🏭', color: '#60a5fa', r: 96, g: 165, b: 250 },
    { label: 'Categories', value: stats.categories, icon: '📂', color: '#a78bfa', r: 167, g: 139, b: 250 },
    { label: 'In Stock', value: stats.inStock, icon: '✅', color: '#34d399', r: 52, g: 211, b: 153 },
  ];

  return (
    <>
      <div className="app-body">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div>
            <span className="sidebar-label">Make</span>
            <input
              id="search-make"
              className="sidebar-input"
              placeholder="e.g. Tata, Maruti..."
              value={filterMake}
              onChange={e => setFilterMake(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <span className="sidebar-label">Model</span>
            <input
              id="search-model"
              className="sidebar-input"
              placeholder="e.g. Nexon, Swift..."
              value={filterModel}
              onChange={e => setFilterModel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <span className="sidebar-label">Category</span>
            <div className="cat-pill-list">
              {CATEGORIES.map(cat => {
                const c = getCatColor(cat);
                return (
                  <button
                    key={cat}
                    className={`cat-pill ${filterCategory === cat ? 'active' : ''}`}
                    style={{ '--pill-color': c.color, '--pill-r': c.r, '--pill-g': c.g, '--pill-b': c.b } as React.CSSProperties}
                    onClick={() => setFilterCategory(prev => prev === cat ? '' : cat)}
                  >
                    <span className="cat-dot" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="sidebar-label">Price Range (₹)</span>
            <div className="price-grid">
              <input
                id="search-min-price"
                type="number"
                className="sidebar-input"
                placeholder="Min"
                value={filterMinPrice}
                onChange={e => setFilterMinPrice(e.target.value)}
              />
              <input
                id="search-max-price"
                type="number"
                className="sidebar-input"
                placeholder="Max"
                value={filterMaxPrice}
                onChange={e => setFilterMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-bottom">
            <button
              id="search-submit"
              className="btn btn-primary btn-full"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? '⏳ Searching...' : '🔍 Search'}
            </button>
            <button className="btn btn-ghost btn-full btn-sm" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="main-content">
          {/* Stats bar */}
          <div className="stats-bar">
            {STATS.map(s => (
              <div
                key={s.label}
                className="stat-card"
                style={{ '--stat-color': s.color, '--stat-r': s.r, '--stat-g': s.g, '--stat-b': s.b } as React.CSSProperties}
              >
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{isLoading ? '—' : s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="page-header">
            <div>
              <div className="page-title">Inventory</div>
              <div className="page-count">
                {isLoading ? 'Loading...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} found`}
              </div>
            </div>
          </div>

          {/* Content */}
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
                  ? 'Try adjusting the filters in the sidebar.'
                  : isAdmin
                  ? 'Go to Admin Panel to add vehicles.'
                  : 'Check back later.'}
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

          <div style={{ height: 48 }} />
        </main>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
