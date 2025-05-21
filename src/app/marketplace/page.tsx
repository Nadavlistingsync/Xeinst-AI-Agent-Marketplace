'use client';

import { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetch('/api/list-products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(product => product.category)));

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Software Marketplace
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Browse ready-made software uploaded by the community — automate your workflow in seconds.
          </p>
        </motion.div>
        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-black/50 glow-border card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                  {product.category}
                </span>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-white/80">-</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 glow-text">{product.name}</h3>
              <p className="text-white/80 mb-4">{product.description}</p>
              <div className="mb-2 font-bold text-white">${product.price}</div>
              <motion.a
                href={`/product/${product.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-center"
              >
                View Product
              </motion.a>
            </motion.div>
          ))}
        </div>
        {/* Upload Product Button */}
        <div className="text-center mt-12">
          <motion.a
            href="/upload"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-transparent text-blue-400 border-2 border-blue-400 py-3 px-8 rounded-lg hover:bg-blue-400/10 transition-colors duration-300"
          >
            Upload Your Software
          </motion.a>
        </div>
      </div>
    </div>
  );
} 