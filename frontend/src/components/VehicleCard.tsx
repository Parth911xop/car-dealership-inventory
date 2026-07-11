import React from 'react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin?: boolean;
  onPurchase?: (id: string) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Sedan: '🚗',
  SUV: '🚙',
  Sports: '🏎️',
  Truck: '🛻',
  Electric: '⚡',
  Hatchback: '🚘',
  Minivan: '🚐',
  Convertible: '🚕',
};

export default function VehicleCard({
  vehicle,
  isAdmin = false,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  isPurchasing = false,
}: VehicleCardProps) {
  const emoji = CATEGORY_EMOJI[vehicle.category] || '🚗';
  const stockStatus =
    vehicle.quantity === 0
      ? 'out-of-stock'
      : vehicle.quantity <= 3
      ? 'low-stock'
      : 'in-stock';

  const stockLabel =
    vehicle.quantity === 0
      ? 'Out of Stock'
      : vehicle.quantity <= 3
      ? `Only ${vehicle.quantity} left`
      : `${vehicle.quantity} in stock`;

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-image">
        <span style={{ fontSize: 72, filter: vehicle.quantity === 0 ? 'grayscale(1) opacity(0.4)' : 'none' }}>
          {emoji}
        </span>
      </div>

      <div className="vehicle-card-body">
        <div>
          <div className="vehicle-card-category">{vehicle.category}</div>
        </div>

        <div className="vehicle-card-header">
          <div className="vehicle-card-title">
            {vehicle.make} {vehicle.model}
          </div>
          <span className="vehicle-card-year">{vehicle.year}</span>
        </div>

        <div className="vehicle-card-meta">
          {vehicle.color && (
            <span className="vehicle-meta-item">🎨 {vehicle.color}</span>
          )}
          {vehicle.mileage != null && (
            <span className="vehicle-meta-item">📍 {vehicle.mileage.toLocaleString()} mi</span>
          )}
        </div>

        <div className="vehicle-card-price">
          ${vehicle.price.toLocaleString()}
        </div>
      </div>

      <div className="vehicle-card-footer">
        <div className={`stock-badge ${stockStatus}`}>
          <span className="stock-dot" />
          {stockLabel}
        </div>

        <div className="admin-card-actions">
          {isAdmin ? (
            <>
              <button
                id={`restock-${vehicle.id}`}
                className="btn btn-success btn-sm"
                onClick={() => onRestock?.(vehicle)}
                title="Restock"
              >
                📦 Restock
              </button>
              <button
                id={`edit-${vehicle.id}`}
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit?.(vehicle)}
              >
                ✏️
              </button>
              <button
                id={`delete-${vehicle.id}`}
                className="btn btn-danger btn-sm"
                onClick={() => onDelete?.(vehicle.id)}
              >
                🗑️
              </button>
            </>
          ) : (
            <button
              id={`purchase-${vehicle.id}`}
              className="btn btn-primary btn-sm"
              disabled={vehicle.quantity === 0 || isPurchasing}
              onClick={() => onPurchase?.(vehicle.id)}
              aria-label={vehicle.quantity === 0 ? 'Out of stock' : 'Purchase'}
            >
              {vehicle.quantity === 0
                ? 'Unavailable'
                : isPurchasing
                ? '⏳ Processing...'
                : '🛒 Purchase'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
