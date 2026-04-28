import { useState, type ReactNode } from 'react';
import { FileText, ExternalLink, Pencil } from 'lucide-react';
import './MaterialCard.css';

interface MaterialCardProps {
  title: string;
  fileType: string;
  description?: string;
  /** Cover image URL (e.g. monograph photo); falls back to icon on error */
  imageUrl?: string;
  /** When set, replaces the static imageUrl thumb (e.g. authenticated fetch) */
  imageSlot?: ReactNode;
  onView?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
}

export default function MaterialCard({
  title,
  fileType,
  description,
  imageUrl,
  imageSlot,
  onView,
  onEdit,
}: MaterialCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showThumb = imageSlot || (imageUrl && !imgFailed);

  return (
    <article className={`material-card${showThumb ? ' material-card--has-image' : ''}`}>
      <div className="material-card-icon">
        {imageSlot ? (
          <span className="material-card-thumb-slot">{imageSlot}</span>
        ) : showThumb && imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="material-card-thumb"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <FileText size={24} />
        )}
      </div>
      <div className="material-card-body">
        <h3 className="material-card-title">{title}</h3>
        {description && <p className="material-card-desc">{description}</p>}
        <span className="material-card-type">{fileType}</span>
      </div>
      <div className="material-card-actions">
        {onEdit && (
          <button
            className="btn btn-secondary"
            onClick={onEdit}
            title="Edit document"
          >
            <Pencil size={16} />
            Edit
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={onView}
          title="View / Share screen to show customers"
        >
          <ExternalLink size={16} />
          View
        </button>
      </div>
    </article>
  );
}
