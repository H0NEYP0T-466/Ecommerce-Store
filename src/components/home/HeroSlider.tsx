import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { getImageUrl } from '../../utils/format';
import type { Slider } from '../../types';
import './HeroSlider.css';

interface HeroSliderProps {
  sliders: Slider[];
}

export default function HeroSlider({ sliders }: HeroSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % sliders.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [sliders.length]);

  if (!sliders || sliders.length === 0) {
    return (
      <div className="hero-slider-wrap" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="hero-slide-content">
          <h1 className="hero-slide-title">Hamid Cloth House</h1>
          <p className="hero-slide-subtitle">Premium Pakistani clothing, crafted with elegance and tradition.</p>
          <Link to="/products">
            <Button variant="primary" size="lg">Explore Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % sliders.length);
  };

  return (
    <div className="hero-slider-wrap">
      {sliders.map((slider, idx) => (
        <div
          key={slider.id}
          className={`hero-slide ${idx === currentIdx ? 'active' : ''}`}
          style={{ backgroundImage: `url(${getImageUrl(slider.image_url)})` }}
        >
          <div className="hero-slide-overlay" />
          <div className="hero-slide-content">
            <h2 className="hero-slide-title">{slider.title}</h2>
            {slider.subtitle && <p className="hero-slide-subtitle">{slider.subtitle}</p>}
            {slider.link_url && (
              <Link to={slider.link_url}>
                <Button variant="primary" size="lg">Shop Now</Button>
              </Link>
            )}
          </div>
        </div>
      ))}

      {sliders.length > 1 && (
        <>
          <button type="button" className="hero-arrow prev" onClick={prevSlide} aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="hero-arrow next" onClick={nextSlide} aria-label="Next slide">
            <ChevronRight size={20} />
          </button>

          <div className="hero-dots">
            {sliders.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                className={`hero-dot ${idx === currentIdx ? 'active' : ''}`}
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
