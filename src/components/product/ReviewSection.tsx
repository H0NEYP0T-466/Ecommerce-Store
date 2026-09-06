import React, { useState } from 'react';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import { Textarea } from '../ui/Input';
import { formatDate } from '../../utils/format';
import type { Review } from '../../types';
import './ReviewSection.css';

interface ReviewSectionProps {
  reviews: Review[];
  isAuthenticated: boolean;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
}

export default function ReviewSection({
  reviews,
  isAuthenticated,
  onSubmitReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitReview(rating, comment);
      setComment('');
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-section">
      <div className="review-section-header">
        <h2>Customer Reviews ({reviews.length})</h2>
      </div>

      {reviews.length === 0 ? (
        <p style={{ color: 'var(--muted-gray)', marginBottom: '24px' }}>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="review-list">
          {reviews.map((rev) => (
            <div key={rev.id} className="review-item">
              <div className="review-meta">
                <span className="review-author">{rev.user_name}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted-gray)' }}>{formatDate(rev.created_at)}</span>
              </div>
              <StarRating rating={rev.rating} size={14} />
              {rev.comment && <p className="review-comment" style={{ marginTop: '8px' }}>{rev.comment}</p>}
              {rev.admin_reply && (
                <div className="review-admin-reply">
                  <strong>Hamid Cloth House Reply:</strong>
                  <p style={{ marginTop: '4px' }}>{rev.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Submission */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="review-form">
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Write a Review</h3>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Your Rating</label>
            <StarRating rating={rating} interactive onChange={setRating} size={22} />
          </div>
          <Textarea
            label="Your Review"
            placeholder="Tell us about the fabric quality, fitting, and delivery experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
          />
          <Button variant="primary" type="submit" disabled={submitting || !comment.trim()}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--body-gray)' }}>
          Please log in to write a review.
        </p>
      )}
    </div>
  );
}
