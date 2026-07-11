import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi } from '../api';
import type { Vehicle } from '../types';
import VehicleCard from '../components/VehicleCard';
import VehicleForm from '../components/VehicleForm';
import Toast from '../components/Toast';
import type { ToastMessage } from '../components/Toast';

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
          <h2 className="modal-title">📦 Restock Vehicle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
          {vehicle.make} {vehicle.model} ({vehicle.year}) — currently <strong style={{ color: 'var(--text-primary)' }}>{vehicle.quantity}</strong> in stock
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Quantity to add *</label>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="restock-submit" type="submit" className="btn btn-success" disabled={isLoading || !qty || parseInt(qty) <= 0}>
              {isLoading ? '⏳ Restocking...' : '📦 Restock'}
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
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
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
    } catch {
      addToast('error', 'Failed to load vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsMutating(true);
    try {
      const res = await vehiclesApi.create(data);
      setVehicles(prev => [res.data, ...prev]);
      setShowForm(false);
      addToast('success', `${data.make} ${data.model} added to inventory!`);
    } catch (err: any) {
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdate = async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editVehicle) return;
    setIsMutating(true);
    try {
      const res = await vehiclesApi.update(editVehicle.id, data);
      setVehicles(prev => prev.map(v => v.id === editVehicle.id ? res.data : v));
      setEditVehicle(null);
      addToast('success', 'Vehicle updated successfully!');
    } catch (err: any) {
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehiclesApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      addToast('success', 'Vehicle deleted.');
    } catch {
      addToast('error', 'Failed to delete vehicle.');
    }
  };

  const handleRestock = async (id: string, quantity: number) => {
    try {
      const res = await vehiclesApi.restock(id, quantity);
      setVehicles(prev => prev.map(v => v.id === id ? res.data : v));
      setRestockVehicle(null);
      addToast('success', `Restocked ${quantity} units successfully!`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Restock failed.';
      addToast('error', msg);
    }
  };

  return (
    <>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">⚙️ Admin Panel</h1>
            <p className="page-subtitle">Manage your vehicle inventory</p>
          </div>
          <button
            id="add-vehicle-btn"
            className="btn btn-primary"
            onClick={() => { setEditVehicle(null); setShowForm(true); }}
          >
            ➕ Add Vehicle
          </button>
        </div>

        <div className="admin-banner">
          <div>
            <div className="admin-banner-title">🛡️ Admin Mode</div>
            <div className="admin-banner-text">
              You have full control over the inventory. Changes are applied immediately.
            </div>
          </div>
          <span style={{ fontSize: 28 }}>🔑</span>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading inventory...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No vehicles yet</h3>
            <p>Click &quot;Add Vehicle&quot; above to get started.</p>
          </div>
        ) : (
          <div className="vehicle-grid">
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

        <div style={{ height: 60 }} />
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
