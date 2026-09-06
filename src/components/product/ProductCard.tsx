import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StarRating from '../ui/StarRating';
import { formatPKR, getImageUrl } from '../../utils/format';
import type { Product } from '../../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasDiscount = product.discount_price && product.discount_price < product.actual_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.actual_price - product.discount_price!) / product.actual_price) * 100)
    : 0;

  const primaryImg = getImageUrl(product.primary_image || '');
  const secondaryImg = product.secondary_image ? getImageUrl(product.secondary_image) : null;

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      <div className="product-card-image-wrap">
        <img
          src={isHovered && secondaryImg ? secondaryImg : primaryImg}
          alt={product.name}
          className={`product-card-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {hasDiscount && (
          <span className="product-card-badge">-{discountPercent}%</span>
        )}
        {product.total_stock === 0 && (
          <span className="product-card-badge product-card-badge--out">Out of Stock</span>
        )}
      </div>

      <div className="product-card-info">
        {product.category_name && (
          <span className="product-card-category">{product.category_name}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-price">
          <span className="price-current">{formatPKR(hasDiscount ? product.discount_price! : product.actual_price)}</span>
          {hasDiscount && <span className="price-original">{formatPKR(product.actual_price)}</span>}
        </div>

        {product.average_rating && product.review_count > 0 && (
          <div className="product-card-rating">
            <StarRating rating={Math.round(product.average_rating)} size={12} />
            <span className="rating-count">({product.review_count})</span>
          </div>
        )}
      </div>
    </article>
  );
}
