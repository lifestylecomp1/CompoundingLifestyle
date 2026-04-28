import './ProductCard.css';

interface ProductCardProps {
  name: string;
  category: string;
  description: string;
  sizes: string[];
  notes?: string;
}

export default function ProductCard({ name, category, description, sizes, notes }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card-header">
        <h3 className="product-card-name">{name}</h3>
        <span className="product-card-category">{category}</span>
      </div>
      <p className="product-card-desc">{description}</p>
      <div className="product-card-sizes">
        <span className="sizes-label">Sizes:</span>
        <span className="sizes-list">{sizes.join(', ')}</span>
      </div>
      {notes && (
        <p className="product-card-notes">
          <strong>Note:</strong> {notes}
        </p>
      )}
    </article>
  );
}
