import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { productService } from '../../services/products';
import type { Product, Category } from '../../types';
import api from '../../services/api';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: 20, sort };
      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);

      const data = await productService.getProducts(params);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
    setLoading(false);
  }, [page, category, search, sort, minPrice, maxPrice]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => {
    api.get('/api/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const flatCategories: { id: string; name: string; slug: string; depth: number }[] = [];
  const flatten = (cats: Category[], depth = 0) => {
    cats.forEach(c => {
      flatCategories.push({ id: c.id, name: c.name, slug: c.slug, depth });
      if (c.children) flatten(c.children, depth + 1);
    });
  };
  flatten(categories);

  const totalPages = Math.ceil(total / 20);
  const hasFilters = category || search || minPrice || maxPrice;

  return (
    <>
      <Helmet>
        <title>{`${search ? `Search: "${search}"` : category ? `${category} — Products` : 'All Products'} | Hamid Cloth House`}</title>
      </Helmet>

      <div className="products-page container">
        <div className="products-header">
          <div>
            <h1>{search ? `Results for "${search}"` : 'Shop'}</h1>
            <p className="products-count">{total} product{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="products-controls">
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <h6 className="filter-title">Category</h6>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${!category ? 'active' : ''}`}
                  onClick={() => updateFilter('category', '')}
                >All</button>
                {flatCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`filter-chip ${category === cat.slug ? 'active' : ''}`}
                    onClick={() => updateFilter('category', cat.slug)}
                    style={{ paddingLeft: cat.depth > 0 ? '16px' : undefined }}
                  >
                    {cat.depth > 0 ? '└ ' : ''}{cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h6 className="filter-title">Price Range (PKR)</h6>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  className="price-input"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>
            {hasFilters && (
              <button className="clear-filters" onClick={clearFilters}>
                <X size={14} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.length === 0
              ? <div className="no-products">
                  <p>No products found.</p>
                  {hasFilters && <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>}
                </div>
              : products.map((product) => <ProductCard key={product.id} product={product} />)
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <Button variant="chip" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <Button variant="chip" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </>
  );
}
