import { useState, useEffect } from 'react';

import { Plus, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatPKR } from '../../utils/format';
import type { Product } from '../../types';
import './Admin.css';

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');


  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts({ page, page_size: 20, search: search || undefined });
      setProducts(data.products);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    try { await adminService.deleteProduct(id); toast('Product deactivated'); load(); }
    catch { toast('Failed', 'error'); }
  };

  const handleDuplicate = async (id: string) => {
    try { await adminService.duplicateProduct(id); toast('Product duplicated'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-section-header">
        <h1>Products ({total})</h1>
        <Button variant="primary" onClick={() => {/* TODO: product create modal/page */}}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          fullWidth={false}
          style={{ maxWidth: '300px' }}
        />
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category_name || '—'}</td>
                  <td>
                    {p.discount_price && p.discount_price < p.actual_price
                      ? <><span>{formatPKR(p.discount_price)}</span> <s style={{ color: 'var(--muted-gray)', fontSize: '12px' }}>{formatPKR(p.actual_price)}</s></>
                      : formatPKR(p.actual_price)
                    }
                  </td>
                  <td>
                    <Badge variant={p.total_stock > 5 ? 'success' : p.total_stock > 0 ? 'warning' : 'error'}>
                      {p.total_stock}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={p.is_active ? 'success' : 'default'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="table-action" title="Duplicate" onClick={() => handleDuplicate(p.id)}>📋</button>
                      <button className="table-action" title="Deactivate" onClick={() => handleDelete(p.id)}>
                        {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="pagination" style={{ marginTop: '16px' }}>
            <Button variant="chip" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span>{page} / {Math.ceil(total / 20)}</span>
            <Button variant="chip" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
