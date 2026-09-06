import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import Button from '../ui/Button';
import type { Product } from '../../types';
import './FeaturedProducts.css';

interface FeaturedProductsProps {
  title?: string;
  products: Product[];
  viewAllLink?: string;
}

export default function FeaturedProducts({
  title = 'Featured Collection',
  products,
  viewAllLink = '/products',
}: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="featured-products-section">
      <div className="section-header-wrap">
        <h2 className="section-title">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
        )}
      </div>

      <div className="products-grid-layout">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
