import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import type { Product, Slider, Promotion } from '../../types';
import './Home.css';

export default function Home() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [slidersRes, productsRes, promoRes] = await Promise.all([
          api.get('/api/sliders'),
          api.get('/api/products', { params: { page_size: 8, sort: 'newest' } }),
          api.get('/api/promotions'),
        ]);
        setSliders(slidersRes.data);
        setNewArrivals(productsRes.data.products);
        setPromotions(promoRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Auto-cycle sliders
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  return (
    <>
      <Helmet>
        <title>Hamid Cloth House — Premium Pakistani Clothing Online</title>
        <meta name="description" content="Shop premium Pakistani clothing for men and women. Kurtas, shalwar kameez, waistcoats, shawls, suits and more. Free delivery across Pakistan." />
      </Helmet>

      {/* ═══ Hero Slider ═══ */}
      {sliders.length > 0 && (
        <section className="hero-slider">
          <div className="slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {sliders.map((slide) => (
              <div key={slide.id} className="slide">
                <img src={slide.image_url} alt={slide.title || ''} className="slide-image" />
                <div className="slide-overlay">
                  <div className="slide-content container">
                    {slide.title && <h1 className="slide-title">{slide.title}</h1>}
                    {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
                    <Link to={slide.link_url || '/products'}>
                      <Button variant="primary" size="lg">
                        Shop Now <ArrowRight size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sliders.length > 1 && (
            <div className="slider-dots">
              {sliders.map((_, i) => (
                <button
                  key={i}
                  className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══ Categories Showcase ═══ */}
      <section className="home-section container">
        <div className="categories-grid">
          <Link to="/products?category=mens-clothing" className="category-card category-card--large">
            <img src="https://placehold.co/700x400/1a1a1a/ffffff?text=Men's+Collection" alt="Men's Collection" />
            <div className="category-card-overlay">
              <h3>Men's Collection</h3>
              <span className="category-cta">Shop Now <ArrowRight size={16} /></span>
            </div>
          </Link>
          <Link to="/products?category=womens-clothing" className="category-card category-card--large">
            <img src="https://placehold.co/700x400/333333/ffffff?text=Women's+Collection" alt="Women's Collection" />
            <div className="category-card-overlay">
              <h3>Women's Collection</h3>
              <span className="category-cta">Shop Now <ArrowRight size={16} /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══ New Arrivals ═══ */}
      <section className="home-section container">
        <div className="section-header">
          <h2>New Arrivals</h2>
          <Link to="/products?sort=newest" className="section-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </div>
      </section>

      {/* ═══ Promotions Banner ═══ */}
      {promotions.length > 0 && (
        <section className="promo-banner">
          <div className="container">
            <div className="promo-content">
              <h2>{promotions[0].title}</h2>
              <p>{promotions[0].description}</p>
              <Link to="/products">
                <Button variant="secondary" size="lg">
                  Shop the Sale <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Trust Badges ═══ */}
      <section className="trust-section container">
        <div className="trust-grid">
          <div className="trust-item">
            <Truck size={28} />
            <div>
              <h6>Free Delivery</h6>
              <p>On orders above Rs. 3,000</p>
            </div>
          </div>
          <div className="trust-item">
            <Shield size={28} />
            <div>
              <h6>Secure Payment</h6>
              <p>100% secure checkout</p>
            </div>
          </div>
          <div className="trust-item">
            <RefreshCw size={28} />
            <div>
              <h6>Easy Returns</h6>
              <p>7-day return policy</p>
            </div>
          </div>
          <div className="trust-item">
            <Headphones size={28} />
            <div>
              <h6>24/7 Support</h6>
              <p>WhatsApp & phone</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
