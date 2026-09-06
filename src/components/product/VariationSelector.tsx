import type { ProductVariation } from '../../types';
import './VariationSelector.css';

interface VariationSelectorProps {
  variations: ProductVariation[];
  selectedVariation: ProductVariation | null;
  onSelect: (variation: ProductVariation) => void;
}

export default function VariationSelector({
  variations,
  selectedVariation,
  onSelect,
}: VariationSelectorProps) {
  if (!variations || variations.length === 0) return null;

  return (
    <div className="variation-selector">
      <div>
        <p className="selector-group-label">
          Color & Style: <strong>{selectedVariation?.color || 'Select'}</strong>
        </p>
        <div className="selector-pills">
          {variations.map((v) => {
            const isSelected = selectedVariation?.id === v.id;
            const isOutOfStock = v.stock_quantity <= 0;

            return (
              <button
                key={v.id}
                type="button"
                className={`variation-pill ${isSelected ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                onClick={() => onSelect(v)}
                disabled={isOutOfStock}
              >
                <span>{v.color}</span>
                {v.size && <span>• {v.size}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
