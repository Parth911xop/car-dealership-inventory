import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const CATEGORIES = ['Sedan', 'SUV', 'Sports', 'Truck', 'Electric', 'Hatchback', 'Minivan', 'Convertible'];

export default function VehicleForm({ vehicle, onSubmit, onClose, isLoading }: VehicleFormProps) {
  const [form, setForm] = useState({
    make: '',
    model: '',
    category: 'Sedan',
    price: '',
    quantity: '',
    year: String(new Date().getFullYear()),
    color: '',
    mileage: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicle) {
      setForm({
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        price: String(vehicle.price),
        quantity: String(vehicle.quantity),
        year: String(vehicle.year),
        color: vehicle.color || '',
        mileage: vehicle.mileage != null ? String(vehicle.mileage) : '',
      });
    }
  }, [vehicle]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.make || !form.model || !form.category || !form.price || !form.quantity || !form.year) {
      setError('All required fields must be filled.');
      return;
    }

    try {
      await onSubmit({
        make: form.make.trim(),
        model: form.model.trim(),
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        year: parseInt(form.year, 10),
        color: form.color.trim() || undefined,
        mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Something went wrong.');
    }
  };

  const isEditing = !!vehicle;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="form-group">
              <label className="form-label">Make *</label>
              <input id="vehicle-make" className="form-input" placeholder="Toyota" value={form.make} onChange={set('make')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input id="vehicle-model" className="form-input" placeholder="Camry" value={form.model} onChange={set('model')} required />
            </div>
          </div>

          <div className="modal-form-grid">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select id="vehicle-category" className="form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <input id="vehicle-year" type="number" className="form-input" min={1886} max={2027} value={form.year} onChange={set('year')} required />
            </div>
          </div>

          <div className="modal-form-grid">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input id="vehicle-price" type="number" className="form-input" placeholder="25000" min={0} step={0.01} value={form.price} onChange={set('price')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input id="vehicle-quantity" type="number" className="form-input" placeholder="10" min={0} value={form.quantity} onChange={set('quantity')} required />
            </div>
          </div>

          <div className="modal-form-grid">
            <div className="form-group">
              <label className="form-label">Color</label>
              <input id="vehicle-color" className="form-input" placeholder="Silver" value={form.color} onChange={set('color')} />
            </div>
            <div className="form-group">
              <label className="form-label">Mileage (mi)</label>
              <input id="vehicle-mileage" type="number" className="form-input" placeholder="0" min={0} value={form.mileage} onChange={set('mileage')} />
            </div>
          </div>

          {error && <p className="form-error">⚠️ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="vehicle-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? '⏳ Saving...' : isEditing ? '✏️ Update Vehicle' : '➕ Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
