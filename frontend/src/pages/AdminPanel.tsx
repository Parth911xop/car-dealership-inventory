import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi } from '../api';
import type { Vehicle } from '../types';
import VehicleCard from '../components/VehicleCard';
import VehicleForm from '../components/VehicleForm';
import Toast, { type ToastMessage } from '../components/Toast';

interface RestockModalProps {
  vehicle: Vehicle;
  onRestock: (id: string, qty: number) => Promise<void>;
  onClose: () => void;
}

function RestockModal({ vehicle, onRestock, onClose }: RestockModalProps) {
  const [qty, setQty] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onRestock(vehicle.id, parseInt(qty, 10));
    setIsLoading(false);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h2 className="modal-title">📦 Restock</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 13 }}>
          {vehicle.make} {vehicle.model} — currently{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{vehicle.quantity}</strong> in stock
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Units to add</label>
            <input
              id="restock-qty"
              type="number"
              className="form-input"
              min={1}
              value={qty}
              onChange={e => setQty(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              id="restock-submit"
              type="submit"
              className="btn btn-success"
              disabled={isLoading || !qty || parseInt(qty) <= 0}
            >
              {isLoading ? '⏳ Restocking...' : '📦 Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    fetchVehicles();
  }, [isAdmin]);

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
    } catch { addToast('error', 'Failed to load vehicles.'); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsMutating(true);
    try {
      const res = await vehiclesApi.create(data);
      setVehicles(prev => [res.data, ...prev]);
      setShowForm(false);
      addToast('success', `${data.make} ${data.model} added!`);
    } catch (err) { throw err; }
    finally { setIsMutating(false); }
  };

  const handleUpdate = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editVehicle) return;
    setIsMutating(true);
    try {
      const res = await vehiclesApi.update(editVehicle.id, data);
      setVehicles(prev => prev.map(v => v.id === editVehicle.id ? res.data : v));
      setEditVehicle(null);
      setShowForm(false);
      addToast('success', 'Vehicle updated!');
    } catch (err) { throw err; }
    finally { setIsMutating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this vehicle permanently?')) return;
    try {
      await vehiclesApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      addToast('success', 'Vehicle deleted.');
    } catch { addToast('error', 'Failed to delete vehicle.'); }
  };

  const handleRestock = async (id: string, quantity: number) => {
    try {
      const res = await vehiclesApi.restock(id, quantity);
      setVehicles(prev => prev.map(v => v.id === id ? res.data : v));
      setRestockVehicle(null);
      addToast('success', `+${quantity} units restocked!`);
    } catch (err: unknown) {
      addToast('error', (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Restock failed.');
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: vehicles.length,
    outOfStock: vehicles.filter(v => v.quantity === 0).length,
    lowStock: vehicles.filter(v => v.quantity > 0 && v.quantity <= 3).length,
    brands: new Set(vehicles.map(v => v.make)).size,
  }), [vehicles]);

  return (
    <>
      <div style={{ padding: '20px 28px', maxWidth: 1200, margin: '0 auto', paddingTop: `calc(var(--navbar-height, 54px) + 20px)` }}>
        {/* Stats bar */}
        <div className="stats-bar" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total', value: stats.total, icon: '🚗', color: '#f97316', r: 249, g: 115, b: 22 },
            { label: 'Brands', value: stats.brands, icon: '🏭', color: '#60a5fa', r: 96, g: 165, b: 250 },
            { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', color: '#fbbf24', r: 251, g: 191, b: 36 },
            { label: 'Out of Stock', value: stats.outOfStock, icon: '🚫', color: '#f87171', r: 248, g: 113, b: 113 },
          ].map(s => (
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

        {/* Admin banner */}
        <div className="admin-banner">
          <div>
            <div className="admin-banner-title">🛡️ Admin Control Panel</div>
            <div className="admin-banner-sub">Full inventory management — changes are live immediately.</div>
          </div>
          <button
            id="add-vehicle-btn"
            className="btn btn-primary"
            onClick={() => { setEditVehicle(null); setShowForm(true); }}
          >
            ➕ Add Vehicle
          </button>
        </div>

        {/* Page header */}
        <div className="page-header">
          <div>
            <div className="page-title">All Vehicles</div>
            <div className="page-count">{isLoading ? '...' : `${vehicles.length} vehicles in inventory`}</div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading...</p></div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No vehicles yet</h3>
            <p>Click &quot;Add Vehicle&quot; above to get started.</p>
          </div>
        ) : (
          <div className="vehicle-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
            {vehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin
                onEdit={vehicle => { setEditVehicle(vehicle); setShowForm(true); }}
                onDelete={handleDelete}
                onRestock={vehicle => setRestockVehicle(vehicle)}
              />
            ))}
          </div>
        )}

        <div style={{ height: 48 }} />
      </div>

      {showForm && (
        <VehicleForm
          vehicle={editVehicle}
          onSubmit={editVehicle ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditVehicle(null); }}
          isLoading={isMutating}
        />
      )}

      {restockVehicle && (
        <RestockModal
          vehicle={restockVehicle}
          onRestock={handleRestock}
          onClose={() => setRestockVehicle(null)}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
