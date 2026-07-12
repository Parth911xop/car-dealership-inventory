import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VehicleCard from '../components/VehicleCard';
import type { Vehicle } from '../types';

const mockVehicle: Vehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
  year: 2023,
  color: 'Silver',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('VehicleCard', () => {
  it('renders vehicle make and model', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText(/Toyota Camry/i)).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText(/₹25,000/)).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('Sedan')).toBeInTheDocument();
  });

  it('disables purchase button when quantity is 0', () => {
    render(<VehicleCard vehicle={{ ...mockVehicle, quantity: 0 }} />);
    const btn = screen.getByRole('button', { name: /out of stock/i });
    expect(btn).toBeDisabled();
  });

  it('enables purchase button when quantity > 0', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    const btn = screen.getByRole('button', { name: /purchase/i });
    expect(btn).not.toBeDisabled();
  });

  it('shows out-of-stock badge when quantity is 0', () => {
    render(<VehicleCard vehicle={{ ...mockVehicle, quantity: 0 }} />);
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  it('shows low-stock badge when quantity <= 3', () => {
    render(<VehicleCard vehicle={{ ...mockVehicle, quantity: 2 }} />);
    expect(screen.getByText(/only 2 left/i)).toBeInTheDocument();
  });

  it('shows in-stock count when quantity > 3', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText(/5 in stock/i)).toBeInTheDocument();
  });

  it('shows admin controls (edit, delete, restock) when isAdmin is true', () => {
    render(<VehicleCard vehicle={mockVehicle} isAdmin onEdit={() => {}} onDelete={() => {}} onRestock={() => {}} />);
    expect(screen.getByTitle('Restock')).toBeInTheDocument();
    expect(screen.getByText('✏️')).toBeInTheDocument();
    expect(screen.getByText('🗑️')).toBeInTheDocument();
  });

  it('does not show purchase button when isAdmin is true', () => {
    render(<VehicleCard vehicle={mockVehicle} isAdmin />);
    expect(screen.queryByRole('button', { name: /purchase/i })).not.toBeInTheDocument();
  });
});
