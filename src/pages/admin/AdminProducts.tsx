import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Eye, EyeOff, Trash2, Upload, Wand2, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Textarea, Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatPKR, getImageUrl } from '../../utils/format';
import type { Product, ProductDetail, Category } from '../../types';
import './Admin.css';

// ─── Variation Form State ───

interface VariationFormData {
  id?: string;
  color: string;
  size: string;
  stock_quantity: number;
  images: string[];
  video_url: string;
  is_default: boolean;
}

const EMPTY_VARIATION: VariationFormData = {
  color: '',
  size: '',
  stock_quantity: 0,
  images: [],
  video_url: '',
  is_default: false,
};

// ─── Product Form State ───

interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  actual_price: number;
  discount_price: number | null;
  seo_keywords: string[];
  variations: VariationFormData[];
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  category_id: '',
  actual_price: 0,
  discount_price: null,
  seo_keywords: [],
  variations: [{ ...EMPTY_VARIATION, is_default: true }],
};

// ═══════════════════════════════════════
// IMAGE UPLOADER
// ═══════════════════════════════════════

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages = [...images];
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await adminService.uploadImage(files[i]);
        newImages.push(result.id);
      } catch {
        // skip failed uploads
      }
    }
    onChange(newImages);
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="image-uploader">
      <div className="image-grid">
        {images.map((img, i) => (
          <div key={`${img}-${i}`} className="image-thumb">
            <img src={getImageUrl(img)} alt={`Variation image ${i + 1}`} />
            <button className="image-remove" onClick={() => removeImage(i)} type="button">
              <X size={12} />
            </button>
          </div>
        ))}
        <label className="image-add-btn">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <span className="upload-spinner" />
          ) : (
            <>
              <Upload size={18} />
              <span>Upload</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// VARIATION PANEL
// ═══════════════════════════════════════

function VariationPanel({
  variation,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  variation: VariationFormData;
  index: number;
  onChange: (index: number, data: VariationFormData) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const update = (key: keyof VariationFormData, value: unknown) => {
    onChange(index, { ...variation, [key]: value });
  };

  return (
    <div className="variation-panel">
      <div className="variation-header">
        <div className="variation-header-left">
          <GripVertical size={14} className="variation-grip" />
          <span className="variation-label">Variation {index + 1}</span>
          {variation.is_default && <Badge variant="info">Default</Badge>}
        </div>
        <div className="variation-header-right">
          {!variation.is_default && (
            <button
              type="button"
              className="table-action"
              title="Set as default"
              onClick={() => update('is_default', true)}
            >
              Set Default
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              className="table-action"
              title="Remove variation"
              onClick={() => onRemove(index)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="variation-fields">
        <div className="variation-row">
          <Input
            label="Color *"
            value={variation.color}
            onChange={(e) => update('color', e.target.value)}
            placeholder="e.g. Black, White, Navy Blue"
          />
          <Input
            label="Size"
            value={variation.size}
            onChange={(e) => update('size', e.target.value)}
            placeholder="e.g. S, M, L, XL, Free Size"
          />
        </div>
        <div className="variation-row">
          <Input
            label="Stock Quantity *"
            type="number"
            min="0"
            value={variation.stock_quantity.toString()}
            onChange={(e) => update('stock_quantity', parseInt(e.target.value) || 0)}
          />
          <Input
            label="Video URL"
            value={variation.video_url}
            onChange={(e) => update('video_url', e.target.value)}
            placeholder="https://youtube.com/..."
          />
        </div>

        <div className="variation-images-section">
          <label className="input-label">Images (min 2 recommended)</label>
          <ImageUploader
            images={variation.images}
            onChange={(imgs) => update('images', imgs)}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PRODUCT FORM MODAL
// ═══════════════════════════════════════

function ProductFormModal({
  isOpen,
  onClose,
  editProduct,
  categories,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  editProduct: ProductDetail | null;
  categories: Category[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoInput, setSeoInput] = useState('');

  const isEditing = !!editProduct;

  // Flatten categories for select
  const flatCategories = useCallback((): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [{ value: '', label: 'Select Category' }];
    const flatten = (cats: Category[], prefix: string) => {
      for (const cat of cats) {
        result.push({ value: cat.id, label: prefix + cat.name });
        if (cat.children?.length) flatten(cat.children, prefix + '  └ ');
      }
    };
    flatten(categories, '');
    return result;
  }, [categories]);

  // Load edit data
  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        description: editProduct.description,
        category_id: editProduct.category_id,
        actual_price: editProduct.actual_price,
        discount_price: editProduct.discount_price ?? null,
        seo_keywords: editProduct.seo_keywords || [],
        variations: editProduct.variations.map((v) => ({
          id: v.id,
          color: v.color,
          size: v.size || '',
          stock_quantity: v.stock_quantity,
          images: v.images || [],
          video_url: v.video_url || '',
          is_default: v.is_default,
        })),
      });
      setSeoInput((editProduct.seo_keywords || []).join(', '));
    } else {
      setForm({ ...EMPTY_FORM, variations: [{ ...EMPTY_VARIATION, is_default: true }] });
      setSeoInput('');
    }
  }, [editProduct, isOpen]);

  const updateField = (key: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateVariation = (index: number, data: VariationFormData) => {
    const updated = [...form.variations];
    // If setting this as default, unset others
    if (data.is_default) {
      updated.forEach((v, i) => {
        if (i !== index) v.is_default = false;
      });
    }
    updated[index] = data;
    setForm((prev) => ({ ...prev, variations: updated }));
  };

  const addVariation = () => {
    setForm((prev) => ({
      ...prev,
      variations: [...prev.variations, { ...EMPTY_VARIATION }],
    }));
  };

  const removeVariation = (index: number) => {
    const updated = form.variations.filter((_, i) => i !== index);
    // Ensure at least one default
    if (updated.length > 0 && !updated.some((v) => v.is_default)) {
      updated[0].is_default = true;
    }
    setForm((prev) => ({ ...prev, variations: updated }));
  };

  const handleSeoGenerate = async () => {
    if (!editProduct) {
      toast('Save the product first to generate SEO keywords', 'error');
      return;
    }
    setSeoGenerating(true);
    try {
      const result = await adminService.generateSeo(editProduct.id);
      const keywords = result.seo_keywords;
      updateField('seo_keywords', keywords);
      setSeoInput(keywords.join(', '));
      toast('SEO keywords generated');
    } catch {
      toast('Failed to generate SEO', 'error');
    }
    setSeoGenerating(false);
  };

  const handleSeoInputChange = (value: string) => {
    setSeoInput(value);
    const keywords = value
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    updateField('seo_keywords', keywords);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Product name is required';
    if (!form.category_id) return 'Please select a category';
    if (form.actual_price <= 0) return 'Price must be greater than 0';
    if (form.variations.length === 0) return 'At least one variation is required';
    for (let i = 0; i < form.variations.length; i++) {
      if (!form.variations[i].color.trim()) return `Variation ${i + 1}: Color is required`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast(error, 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editProduct) {
        // Update product
        await adminService.updateProduct(editProduct.id, {
          name: form.name,
          description: form.description,
          category_id: form.category_id,
          actual_price: form.actual_price,
          discount_price: form.discount_price,
          seo_keywords: form.seo_keywords,
        });

        // Sync variations: update existing, add new, delete removed
        const existingVarIds = editProduct.variations.map((v) => v.id);
        const formVarIds = form.variations.filter((v) => v.id).map((v) => v.id!);

        // Delete removed variations
        for (const oldId of existingVarIds) {
          if (!formVarIds.includes(oldId)) {
            await adminService.deleteVariation(editProduct.id, oldId);
          }
        }

        // Update existing + create new
        for (const varData of form.variations) {
          const payload = {
            color: varData.color,
            size: varData.size || undefined,
            stock_quantity: varData.stock_quantity,
            images: varData.images,
            video_url: varData.video_url || undefined,
            is_default: varData.is_default,
          };
          if (varData.id) {
            await adminService.updateVariation(editProduct.id, varData.id, payload);
          } else {
            await adminService.addVariation(editProduct.id, payload);
          }
        }

        toast('Product updated successfully');
      } else {
        // Create product with variations
        await adminService.createProduct({
          name: form.name,
          description: form.description,
          category_id: form.category_id,
          actual_price: form.actual_price,
          discount_price: form.discount_price,
          seo_keywords: form.seo_keywords,
          variations: form.variations.map((v) => ({
            color: v.color,
            size: v.size || undefined,
            stock_quantity: v.stock_quantity,
            images: v.images,
            video_url: v.video_url || undefined,
            is_default: v.is_default,
          })),
        });
        toast('Product created successfully');
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast(msg, 'error');
    }
    setSaving(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit: ${editProduct?.name}` : 'Add New Product'}
      size="lg"
    >
      <div className="product-form">
        {/* ── Product Details ── */}
        <section className="pf-section">
          <h4 className="pf-section-title">Product Details</h4>
          <div className="pf-grid-2">
            <Input
              label="Product Name *"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. Men's Cotton Kurta"
            />
            <Select
              label="Category *"
              value={form.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              options={flatCategories()}
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the product in detail..."
            rows={4}
          />
          <div className="pf-grid-2">
            <Input
              label="Actual Price (PKR) *"
              type="number"
              min="0"
              value={form.actual_price.toString()}
              onChange={(e) => updateField('actual_price', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Discount Price (PKR)"
              type="number"
              min="0"
              value={form.discount_price?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField('discount_price', val ? parseFloat(val) : null);
              }}
              placeholder="Leave empty for no discount"
            />
          </div>
        </section>

        {/* ── SEO Keywords ── */}
        <section className="pf-section">
          <div className="pf-section-header">
            <h4 className="pf-section-title">SEO Keywords</h4>
            <Button
              variant="chip"
              onClick={handleSeoGenerate}
              disabled={seoGenerating}
            >
              <Wand2 size={14} />
              {seoGenerating ? 'Generating...' : 'Auto-Generate'}
            </Button>
          </div>
          <Input
            value={seoInput}
            onChange={(e) => handleSeoInputChange(e.target.value)}
            placeholder="Comma-separated keywords, e.g. kurta, cotton, men's clothing"
          />
          {form.seo_keywords.length > 0 && (
            <div className="seo-tags">
              {form.seo_keywords.map((kw, i) => (
                <span key={i} className="seo-tag">{kw}</span>
              ))}
            </div>
          )}
        </section>

        {/* ── Variations ── */}
        <section className="pf-section">
          <div className="pf-section-header">
            <h4 className="pf-section-title">Variations ({form.variations.length})</h4>
            <Button variant="chip" onClick={addVariation}>
              <Plus size={14} /> Add Variation
            </Button>
          </div>
          <div className="variations-list">
            {form.variations.map((v, i) => (
              <VariationPanel
                key={v.id || `new-${i}`}
                variation={v}
                index={i}
                onChange={updateVariation}
                onRemove={removeVariation}
                canRemove={form.variations.length > 1}
              />
            ))}
          </div>
        </section>

        {/* ── Actions ── */}
        <div className="pf-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════
// ADMIN PRODUCTS PAGE
// ═══════════════════════════════════════

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts({ page, page_size: 20, search: search || undefined });
      setProducts(data.products);
      setTotal(data.total);
    } catch {
      toast('Failed to load products', 'error');
    }
    setLoading(false);
  }, [page, search]);

  const loadCategories = async () => {
    try {
      const cats = await adminService.getCategories();
      setCategories(cats);
    } catch {}
  };

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCategories(); }, []);

  const handleCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleEdit = async (id: string) => {
    try {
      // Fetch full product detail with variations via public slug endpoint
      // The admin getProducts doesn't return variations, so we use the public detail endpoint
      const detail = await (await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8015'}/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
      })).json();
      setEditProduct(detail);
      setShowForm(true);
    } catch {
      toast('Failed to load product details', 'error');
    }
  };



  const handleDuplicate = async (id: string) => {
    try {
      await adminService.duplicateProduct(id);
      toast('Product duplicated');
      load();
    } catch {
      toast('Failed', 'error');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await adminService.updateProduct(product.id, { is_active: !product.is_active });
      toast(product.is_active ? 'Product deactivated' : 'Product activated');
      load();
    } catch {
      toast('Failed', 'error');
    }
  };

  return (
    <>
      <Helmet><title>Products | Admin — Hamid Cloth House</title></Helmet>
      <div className="admin-content">
        <div className="admin-section-header">
          <h1>Products ({total})</h1>
          <Button variant="primary" onClick={handleCreate}>
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
          {loading ? (
            <div className="no-data">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-data">
              {search ? `No products found for "${search}"` : 'No products yet. Click "Add Product" to create one.'}
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-thumb">
                          {p.primary_image ? (
                            <img src={getImageUrl(p.primary_image)} alt={p.name} />
                          ) : (
                            <div className="product-thumb-placeholder">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        {p.seo_keywords?.length > 0 && (
                          <div className="product-tags-preview">
                            {p.seo_keywords.slice(0, 2).map((kw, i) => (
                              <span key={i} className="mini-tag">{kw}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{p.category_name || '—'}</td>
                      <td>
                        {p.discount_price && p.discount_price < p.actual_price
                          ? <>
                              <span>{formatPKR(p.discount_price)}</span>{' '}
                              <s style={{ color: 'var(--muted-gray)', fontSize: '12px' }}>{formatPKR(p.actual_price)}</s>
                            </>
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
                          <button className="table-action" title="Edit" onClick={() => handleEdit(p.id)}>✏️</button>
                          <button className="table-action" title="Duplicate" onClick={() => handleDuplicate(p.id)}>📋</button>
                          <button className="table-action" title={p.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(p)}>
                            {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 20 && (
            <div className="pagination" style={{ marginTop: '16px' }}>
              <Button variant="chip" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <span>{page} / {Math.ceil(total / 20)}</span>
              <Button variant="chip" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditProduct(null); }}
        editProduct={editProduct}
        categories={categories}
        onSaved={load}
      />
    </>
  );
}
