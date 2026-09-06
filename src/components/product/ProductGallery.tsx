import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/format';
import './ProductGallery.css';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Reset selected image when variations change
  useEffect(() => {
    setSelectedIdx(0);
  }, [images]);

  const displayImages = images.length > 0 ? images : [''];

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img
          src={getImageUrl(displayImages[selectedIdx])}
          alt={`${productName} view ${selectedIdx + 1}`}
        />
      </div>

      {displayImages.length > 1 && (
        <div className="gallery-thumbs">
          {displayImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              className={`gallery-thumb ${selectedIdx === idx ? 'active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
              aria-label={`Show image ${idx + 1}`}
            >
              <img src={getImageUrl(img)} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
