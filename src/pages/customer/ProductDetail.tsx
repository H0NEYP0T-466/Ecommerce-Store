import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { productService } from '../../services/products';
import { formatPKR, getImageUrl } from '../../utils/format';
import type { ProductDetail as ProductDetailType, ProductVariation, Review } from '../../types';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await productService.getProduct(slug);
        setProduct(data);
        const defaultVar = data.variations.find(v => v.is_default) || data.variations[0];
        setSelectedVariation(defaultVar || null);
        if (data.id) {
          const reviewData = await productService.getProductReviews(data.id);
          setReviews(reviewData.reviews);
        }
      } catch {
        setProduct(null);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariation) return;
    if (!isAuthenticated) {
      toast('Please log in to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(selectedVariation.id, quantity);
      toast('Added to cart!');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to add to cart';
      toast(msg, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast('Please log in to submit a review', 'info');
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await productService.createReview(product.id, reviewRating, reviewComment);
      toast('Review submitted! It will appear after approval.');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to submit review';
      toast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentImages = selectedVariation?.images || [];
  const hasDiscount = product?.discount_price && product.discount_price < product.actual_price;

  if (loading) {
    return (
      <div className="pd-page container">
        <div className="pd-layout">
          <Skeleton height="500px" radius="12px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton width="60%" height="32px" />
            <Skeleton width="40%" height="24px" />
            <Skeleton width="30%" height="28px" />
            <Skeleton height="120px" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="pd-page container"><h2>Product not found</h2></div>;
  }

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Hamid Cloth House`}</title>
        <meta name="description" content={product.description.slice(0, 160)} />
        <meta name="keywords" content={product.seo_keywords.join(', ')} />
      </Helmet>

      <div className="pd-page container">
        <div className="pd-layout">
          {/* ─── Gallery ─── */}
          <div className="pd-gallery">
            <div className="pd-main-image-wrap">
              {currentImages.length > 0 ? (
                <img
                  src={getImageUrl(currentImages[selectedImageIdx])}
                  alt={product.name}
                  className="pd-main-image"
                />
              ) : (
                <div className="pd-no-image">No Image Available</div>
              )}
              {currentImages.length > 1 && (
                <>
                  <button className="gallery-nav gallery-nav--prev" onClick={() => setSelectedImageIdx((prev) => (prev - 1 + currentImages.length) % currentImages.length)}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className="gallery-nav gallery-nav--next" onClick={() => setSelectedImageIdx((prev) => (prev + 1) % currentImages.length)}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {currentImages.length > 1 && (
              <div className="pd-thumbs">
                {currentImages.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${i === selectedImageIdx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIdx(i)}
                  >
                    <img src={getImageUrl(img)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Info ─── */}
          <div className="pd-info">
            {product.category_name && (
              <span className="pd-category">{product.category_name}</span>
            )}
            <h1 className="pd-name">{product.name}</h1>

            {product.average_rating && (
              <div className="pd-rating">
                <StarRating rating={Math.round(product.average_rating)} size={18} />
                <span>{product.average_rating} ({product.review_count} review{product.review_count !== 1 ? 's' : ''})</span>
              </div>
            )}

            <div className="pd-price">
              <span className="pd-price-current">{formatPKR(hasDiscount ? product.discount_price! : product.actual_price)}</span>
              {hasDiscount && (
                <>
                  <span className="pd-price-original">{formatPKR(product.actual_price)}</span>
                  <span className="pd-price-save">
                    Save {Math.round(((product.actual_price - product.discount_price!) / product.actual_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="pd-description">{product.description}</p>

            {/* Color Selection */}
            {product.variations.length > 0 && (
              <div className="pd-option-group">
                <h6 className="pd-option-label">Color</h6>
                <div className="pd-color-chips">
                  {product.variations.map((v) => (
                    <button
                      key={v.id}
                      className={`pd-color-chip ${selectedVariation?.id === v.id ? 'active' : ''} ${v.stock_quantity === 0 ? 'out' : ''}`}
                      onClick={() => { setSelectedVariation(v); setSelectedImageIdx(0); setQuantity(1); }}
                      disabled={v.stock_quantity === 0}
                    >
                      {v.color}
                      {v.size && ` / ${v.size}`}
                      {selectedVariation?.id === v.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {selectedVariation && (
              <p className="pd-stock">
                {selectedVariation.stock_quantity > 0
                  ? `${selectedVariation.stock_quantity} in stock`
                  : 'Out of stock'}
              </p>
            )}

            {/* Quantity & Add to Cart */}
            {selectedVariation && selectedVariation.stock_quantity > 0 && (
              <div className="pd-actions">
                <div className="pd-quantity">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(selectedVariation.stock_quantity, quantity + 1))} disabled={quantity >= selectedVariation.stock_quantity}>
                    <Plus size={16} />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={adding}
                  style={{ flex: 1 }}
                >
                  <ShoppingBag size={18} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Reviews ─── */}
        <section className="pd-reviews">
          <h3>Customer Reviews ({reviews.length})</h3>

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <strong>{review.user_name}</strong>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {review.admin_reply && (
                    <div className="review-reply">
                      <strong>Hamid Cloth House:</strong>
                      <p>{review.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          )}

          {isAuthenticated && (
            <div className="review-form">
              <h5>Write a Review</h5>
              <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={24} />
              <textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="review-textarea"
              />
              <Button
                variant="primary"
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewComment.trim()}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
