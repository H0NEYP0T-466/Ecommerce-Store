import { useState, useEffect } from 'react';
import StarRating from '../../components/ui/StarRating';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';
import type { Review } from '../../types';
import './Admin.css';

export default function AdminReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    try { const data = await adminService.getReviews({ page_size: 50 }); setReviews(data.reviews); setTotal(data.total); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleToggleApprove = async (review: Review) => {
    try {
      await adminService.updateReview(review.id, { is_approved: !review.is_approved });
      toast(review.is_approved ? 'Review unapproved' : 'Review approved');
      load();
    } catch {
      toast('Failed to update review status', 'error');
    }
  };

  const handleToggleHide = async (review: Review) => {
    try { await adminService.updateReview(review.id, { is_hidden: !review.is_hidden }); toast(review.is_hidden ? 'Review shown' : 'Review hidden'); load(); }
    catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try { await adminService.deleteReview(id); toast('Review deleted'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <h1>Reviews ({total})</h1>
      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>User</th><th>Rating</th><th>Comment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.user_name}</strong></td>
                  <td><StarRating rating={r.rating} size={12} /></td>
                  <td style={{ maxWidth: '300px' }}>{r.comment}</td>
                  <td>
                    <Badge variant={r.is_hidden ? 'error' : r.is_approved ? 'success' : 'warning'}>
                      {r.is_hidden ? 'Hidden' : r.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button
                        variant={r.is_approved ? 'chip' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleApprove(r)}
                      >
                        {r.is_approved ? 'Unapprove' : 'Approve'}
                      </Button>
                      <Button variant="chip" size="sm" onClick={() => handleToggleHide(r)}>
                        {r.is_hidden ? 'Show' : 'Hide'}
                      </Button>
                      <Button variant="chip" size="sm" onClick={() => handleDelete(r.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
