import { Star } from 'lucide-react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating, maxRating = 5, size = 16, interactive = false, onChange,
}: StarRatingProps) {
  return (
    <div className="star-rating" role={interactive ? 'radiogroup' : 'img'} aria-label={`${rating} out of ${maxRating} stars`}>
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={`star ${i < rating ? 'star--filled' : 'star--empty'} ${interactive ? 'star--interactive' : ''}`}
          fill={i < rating ? 'var(--uber-black)' : 'none'}
          stroke={i < rating ? 'var(--uber-black)' : 'var(--muted-gray)'}
          onClick={() => interactive && onChange?.(i + 1)}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? i < rating : undefined}
          tabIndex={interactive ? 0 : undefined}
        />
      ))}
    </div>
  );
}
