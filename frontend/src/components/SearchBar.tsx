import React, { useState, useCallback } from 'react';
import type { SearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Sports', 'Truck', 'Electric', 'Hatchback', 'Minivan', 'Convertible'];

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters & { category?: string }>({});

  const handleChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleSubmit = useCallback(() => {
    const { category, ...rest } = filters;
    onSearch({
      ...rest,
      category: category === 'All' ? undefined : category,
    });
  }, [filters, onSearch]);

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  return (
    <div className="search-bar">
      <div className="search-grid">
        <div className="form-group">
          <label className="form-label">Make</label>
          <input
            id="search-make"
            className="form-input"
            placeholder="e.g. Toyota"
            value={filters.make || ''}
            onChange={e => handleChange('make', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <input
            id="search-model"
            className="form-input"
            placeholder="e.g. Camry"
            value={filters.model || ''}
            onChange={e => handleChange('model', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            id="search-category"
            className="form-select"
            value={filters.category || 'All'}
            onChange={e => handleChange('category', e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Min Price ($)</label>
          <input
            id="search-min-price"
            type="number"
            className="form-input"
            placeholder="0"
            min={0}
            value={filters.minPrice || ''}
            onChange={e => handleChange('minPrice', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Max Price ($)</label>
          <input
            id="search-max-price"
            type="number"
            className="form-input"
            placeholder="Any"
            min={0}
            value={filters.maxPrice || ''}
            onChange={e => handleChange('maxPrice', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            id="search-submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '🔍'} Search
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset} title="Reset filters">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
