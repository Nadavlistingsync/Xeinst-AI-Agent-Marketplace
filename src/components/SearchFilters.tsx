"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query: string;
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  minRating: number | '';
  sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating';
}

const CATEGORIES = [
  'All',
  'Chatbot',
  'Content Generation',
  'Data Analysis',
  'Image Generation',
  'Language Model',
  'Task Automation',
  'Other',
];

export default function SearchFilters({ onSearch, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      query: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'newest',
    }
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'newest',
    });
    onSearch({
      query: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'newest',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleInputChange}
          placeholder="Search agents..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {filters.query && (
          <button
            type="button"
            onClick={() => {
              setFilters((prev) => ({ ...prev, query: '' }));
              onSearch({ ...filters, query: '' });
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="Min"
            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="Max"
            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
            Min Rating
          </label>
          <input
            type="number"
            id="minRating"
            name="minRating"
            value={filters.minRating}
            onChange={handleInputChange}
            min="0"
            max="5"
            step="0.1"
            placeholder="Min"
            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleInputChange}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-800"
          >
            Reset Filters
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </form>
  );
} 