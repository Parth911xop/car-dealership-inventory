import React from 'react';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin?: boolean;
  onPurchase?: (id: string) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
}

const EMOJI: Record<string, string> = {
  Sedan: '🚗', SUV: '🚙', Sports: '🏎️', Truck: '🛻',
  Electric: '⚡', Hatchback: '🚘', Minivan: '🚐', Convertible: '🚕',
};

const CAT_COLORS: Record<string, { color: string; r: number; g: number; b: number }> = {
  SUV:         { color: '#f97316', r: 249, g: 115, b: 22  },
  Sedan:       { color: '#60a5fa', r: 96,  g: 165, b: 250 },
  Hatchback:   { color: '#a78bfa', r: 167, g: 139, b: 250 },
  Sports:      { color: '#f87171', r: 248, g: 113, b: 113 },
  Electric:    { color: '#34d399', r: 52,  g: 211, b: 153 },
  Truck:       { color: '#fbbf24', r: 251, g: 191, b: 36  },
  Minivan:     { color: '#818cf8', r: 129, g: 140, b: 248 },
  Convertible: { color: '#f472b6', r: 244, g: 114, b: 182 },
};
const DEFAULT_CAT = { color: '#6366f1', r: 99, g: 102, b: 241 };

export const getCatColor = (category: string) => CAT_COLORS[category] ?? DEFAULT_CAT;

export default function VehicleCard({
  vehicle,
  isAdmin = false,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  isPurchasing = false,
}: VehicleCardProps) {
  const emoji = EMOJI[vehicle.category] ?? '🚗';
  const cat = getCatColor(vehicle.category);

  const stockStatus = vehicle.quantity === 0 ? 'out' : vehicle.quantity <= 3 ? 'low' : 'in';
  const stockLabel =
    vehicle.quantity === 0
      ? 'Out of Stock'
      : vehicle.quantity <= 3
      ? `Only ${vehicle.quantity} left`
      : `${vehicle.quantity} in stock`;

  const cardStyle = {
    '--cat-color': cat.color,
    '--cat-r': cat.r,
    '--cat-g': cat.g,
    '--cat-b': cat.b,
  } as React.CSSProperties;

  return (
    <div className="vehicle-card" data-category={vehicle.category} style={cardStyle}>
      {/* Category color bar */}
      <div className="vehicle-card-accent" />

      {/* Emoji icon area */}
      <div className="vehicle-card-icon">
        <span style={{ opacity: vehicle.quantity === 0 ? 0.35 : 1, fontSize: 38 }}>
          {emoji}
        </span>
      </div>

      {/* Card body */}
      <div className="vehicle-card-body">
        {/* Top: info */}
        <div className="vehicle-card-top">
          <div className="vehicle-info">
            <span className="vehicle-cat-tag">{vehicle.category}</span>
            <div className="vehicle-name">{vehicle.make} {vehicle.model}</div>
            <div className="vehicle-specs-row">
              <span className="spec-chip"><span>📅</span><span>{vehicle.year}</span></span>
              {vehicle.color && (
                <span className="spec-chip"><span>🎨</span><span>{vehicle.color}</span></span>
              )}
              {vehicle.mileage != null && vehicle.mileage > 0 && (
                <span className="spec-chip">
                  <span>📍</span>
                  <span>{vehicle.mileage.toLocaleString('en-IN')} km</span>
                </span>
              )}
            </div>
          </div>
          <span className="vehicle-year-badge">{vehicle.year}</span>
        </div>

        {/* Bottom: price + actions */}
        <div className="vehicle-card-bottom">
          <div className="vehicle-price">
            ₹{vehicle.price.toLocaleString('en-IN')}
          </div>

          <div className="vehicle-card-actions">
            <div className={`stock-badge stock-${stockStatus}`}>
              <span className="dot" />
              {stockLabel}
            </div>

            {isAdmin ? (
              <>
                <button
                  id={`restock-${vehicle.id}`}
                  className="btn btn-success btn-sm"
                  title="Restock"
                  onClick={() => onRestock?.(vehicle)}
                >
                  📦
                </button>
                <button
                  id={`edit-${vehicle.id}`}
                  className="btn btn-ghost btn-sm"
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
                className="btn btn-buy btn-sm"
                disabled={vehicle.quantity === 0 || isPurchasing}
                aria-label={vehicle.quantity === 0 ? 'Out of stock' : 'Purchase'}
                onClick={() => onPurchase?.(vehicle.id)}
              >
                {vehicle.quantity === 0
                  ? 'Unavailable'
                  : isPurchasing
                  ? '⏳'
                  : '🛒 Purchase'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
