import { useEffect, useState } from 'react';
import { fetchMonographPhotoObjectUrl } from '../lib/api';
import './AuthMonographPhoto.css';

interface AuthMonographPhotoProps {
  monographId: string;
  className?: string;
  alt?: string;
}

/** Loads monograph cover via Bearer auth (no JWT in URL). */
export default function AuthMonographPhoto({ monographId, className, alt = '' }: AuthMonographPhotoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setFailed(false);
    setSrc(null);
    (async () => {
      try {
        const url = await fetchMonographPhotoObjectUrl(monographId);
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        if (url) setSrc(url);
        else setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [monographId]);

  if (loading) return <div className="auth-monograph-skeleton" aria-hidden />;
  if (failed || !src) return null;
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
